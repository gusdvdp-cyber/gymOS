'use client'

import type { MuscleGroup } from '@gymos/types'

// ─── Shape types ──────────────────────────────────────────────────────────────
interface ShapeRect    { type: 'rect';    x: number; y: number; w: number; h: number; rx?: number }
interface ShapeEllipse { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
type Shape = ShapeRect | ShapeEllipse

// ─── Body parts in a 60 × 130 coordinate space ───────────────────────────────
const PARTS: Record<string, Shape> = {
  head:          { type: 'ellipse', cx: 30, cy: 11, rx: 8,  ry: 9  },
  neck:          { type: 'rect',    x: 27,  y: 19,  w: 6,   h: 7,  rx: 2  },
  leftShoulder:  { type: 'ellipse', cx: 11, cy: 29, rx: 7,  ry: 6  },
  rightShoulder: { type: 'ellipse', cx: 49, cy: 29, rx: 7,  ry: 6  },
  chest:         { type: 'rect',    x: 15,  y: 24,  w: 30,  h: 26, rx: 4  },
  core:          { type: 'rect',    x: 17,  y: 49,  w: 26,  h: 19, rx: 4  },
  leftBicep:     { type: 'rect',    x: 3,   y: 25,  w: 9,   h: 22, rx: 4  },
  rightBicep:    { type: 'rect',    x: 48,  y: 25,  w: 9,   h: 22, rx: 4  },
  leftForearm:   { type: 'rect',    x: 4,   y: 48,  w: 8,   h: 20, rx: 3  },
  rightForearm:  { type: 'rect',    x: 48,  y: 48,  w: 8,   h: 20, rx: 3  },
  hips:          { type: 'rect',    x: 12,  y: 67,  w: 36,  h: 12, rx: 5  },
  leftThigh:     { type: 'rect',    x: 12,  y: 79,  w: 13,  h: 26, rx: 5  },
  rightThigh:    { type: 'rect',    x: 35,  y: 79,  w: 13,  h: 26, rx: 5  },
  leftCalf:      { type: 'rect',    x: 13,  y: 106, w: 11,  h: 22, rx: 4  },
  rightCalf:     { type: 'rect',    x: 36,  y: 106, w: 11,  h: 22, rx: 4  },
}

// ─── Highlight map: which parts light up per muscle group (front + back view) ─
const ALL = Object.keys(PARTS)

const HIGHLIGHTS: Record<MuscleGroup, { front: string[]; back: string[] }> = {
  chest:     { front: ['chest'],                                                    back: []                                                         },
  back:      { front: [],                                                            back: ['chest', 'leftShoulder', 'rightShoulder']                  },
  shoulders: { front: ['leftShoulder', 'rightShoulder'],                            back: ['leftShoulder', 'rightShoulder']                           },
  biceps:    { front: ['leftBicep', 'rightBicep', 'leftForearm', 'rightForearm'],   back: []                                                         },
  triceps:   { front: [],                                                            back: ['leftBicep', 'rightBicep', 'leftForearm', 'rightForearm'] },
  legs:      { front: ['leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'],         back: ['leftThigh', 'rightThigh', 'leftCalf', 'rightCalf']        },
  glutes:    { front: [],                                                            back: ['hips', 'leftThigh', 'rightThigh']                        },
  core:      { front: ['core'],                                                      back: []                                                         },
  cardio:    { front: ALL,                                                           back: ALL                                                        },
  full_body: { front: ALL,                                                           back: ALL                                                        },
  other:     { front: ['chest', 'core'],                                             back: []                                                        },
}

// ─── Render helpers ───────────────────────────────────────────────────────────
// Dark base uses a very faint white so it's barely visible against dark bg.
// Accent highlight is the gym's brand color (CSS variable).
const BASE  = 'rgba(255,255,255,0.08)'
const ACCENT = 'var(--color-accent)'
const BACK_X = 68   // x offset for the posterior silhouette

function renderShape(shape: Shape, xOffset: number, fill: string, key: string) {
  if (shape.type === 'ellipse') {
    return (
      <ellipse
        key={key}
        cx={shape.cx + xOffset}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
        fill={fill}
      />
    )
  }
  return (
    <rect
      key={key}
      x={shape.x + xOffset}
      y={shape.y}
      width={shape.w}
      height={shape.h}
      rx={shape.rx ?? 0}
      fill={fill}
    />
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  muscleGroup: MuscleGroup
  /** Height in px — width is computed from the 128:130 aspect ratio */
  height?: number
  /** Overall SVG opacity (useful for card watermark effect) */
  opacity?: number
}

export default function MuscleGroupSVG({ muscleGroup, height = 88, opacity = 1 }: Props) {
  const { front, back } = HIGHLIGHTS[muscleGroup]
  const frontSet = new Set(front)
  const backSet  = new Set(back)

  // ViewBox: front body 0–60, gap, back body 68–128, height 130
  const VW = 128
  const VH = 130
  const width = Math.round(height * VW / VH)

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={width}
      height={height}
      style={{ display: 'block', opacity }}
      aria-hidden="true"
    >
      {/* ── Front figure ── */}
      {Object.entries(PARTS).map(([key, shape]) =>
        renderShape(shape, 0, frontSet.has(key) ? ACCENT : BASE, `f-${key}`)
      )}

      {/* ── Thin divider ── */}
      <line x1="63" y1="4" x2="63" y2="126" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* ── Back figure ── */}
      {Object.entries(PARTS).map(([key, shape]) =>
        renderShape(shape, BACK_X, backSet.has(key) ? ACCENT : BASE, `b-${key}`)
      )}
    </svg>
  )
}
