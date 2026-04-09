import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    template: '%s | GymOS',
    default: 'GymOS',
  },
  description: 'Plataforma de gestión para gimnasios',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-body), sans-serif' }}
      >
        {children}
      </body>
    </html>
  )
}
