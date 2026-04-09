interface BrandingPreviewProps {
  primaryColor: string
  secondaryColor: string
  logoUrl: string | null
}

export default function BrandingPreview({ primaryColor, secondaryColor, logoUrl }: BrandingPreviewProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border shadow-md"
      style={
        {
          '--color-primary': primaryColor,
          '--color-secondary': secondaryColor,
        } as React.CSSProperties
      }
    >
      {/* Topbar del gym */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: secondaryColor }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded object-contain" />
        ) : (
          <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
        )}
        <span className="text-sm font-semibold text-white">Mi Gimnasio</span>
      </div>

      {/* Contenido simulado */}
      <div className="bg-gray-50 p-4 space-y-3">
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-2">Mi Rutina</p>
          <div className="space-y-1.5">
            {['Sentadilla', 'Press banca', 'Peso muerto'].map((ex) => (
              <div key={ex} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-xs text-gray-700">{ex}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="w-full rounded-lg py-2 text-xs font-semibold text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Registrar entrenamiento
        </button>
      </div>
    </div>
  )
}
