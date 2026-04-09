'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Dumbbell, ClipboardList, Users, UserCog, type LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  clipboard: ClipboardList,
  users: Users,
  usercog: UserCog,
}

interface Stat {
  label: string
  value: number
  href: string
  icon: string
  suffix?: string
}

function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    function tick(now: number) {
      const elapsed = (now - start) / (duration * 1000)
      const progress = Math.min(elapsed, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * to))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [to, duration])

  return <>{count}</>
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat) => {
        const Icon = ICON_MAP[stat.icon]
        return (
          <motion.div key={stat.label} variants={item}>
            <Link
              href={stat.href}
              className="card-hover flex flex-col gap-4 rounded-xl p-5 block transition-all duration-200"
              style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  {Icon && <Icon size={18} style={{ color: 'var(--color-accent)' }} strokeWidth={1.8} />}
                </div>
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: '#444444', fontFamily: 'var(--font-mono)' }}
                >
                  {stat.label}
                </span>
              </div>

              <div>
                <p
                  className="leading-none"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 52,
                    color: '#ffffff',
                    letterSpacing: '0.02em',
                  }}
                >
                  <CountUp to={stat.value} />
                  {stat.suffix}
                </p>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
