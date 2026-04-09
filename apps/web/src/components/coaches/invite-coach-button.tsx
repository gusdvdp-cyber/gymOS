'use client'

import { useState, useTransition, useEffect } from 'react'
import QRCode from 'qrcode'
import { QrCode, Copy, Check, X } from 'lucide-react'
import { createCoachInvitation } from '@/app/(dashboard)/dashboard/coaches/actions'

export default function InviteCoachButton() {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!inviteUrl) return
    QRCode.toDataURL(inviteUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#e8ff47', light: '#111111' },
    }).then(setQrDataUrl)
  }, [inviteUrl])

  function handleGenerate() {
    startTransition(async () => {
      const result = await createCoachInvitation()
      if (result.data) {
        setInviteUrl(result.data.inviteUrl)
        setShowModal(true)
      }
    })
  }

  function handleCopy() {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose() {
    setShowModal(false)
    setInviteUrl(null)
    setQrDataUrl(null)
  }

  return (
    <>
      <button type="button" onClick={handleGenerate} disabled={isPending} className="btn-ghost">
        <QrCode size={14} />
        {isPending ? 'Generando...' : 'Invitar por QR'}
      </button>

      {showModal && inviteUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
          <div className="relative w-full max-w-xs rounded-2xl" style={{ backgroundColor: '#111111', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
              <p style={{ color: '#ffffff', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600 }}>Invitación para profe</p>
              <button type="button" onClick={handleClose} style={{ color: '#444444' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#444444')}
              ><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4 text-center">
              {qrDataUrl ? (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="QR" className="rounded-xl" style={{ border: '1px solid #2a2a2a', padding: 8 }} width={220} height={220} />
                </div>
              ) : (
                <div className="skeleton mx-auto h-[220px] w-[220px] rounded-xl" />
              )}
              <p style={{ color: '#444444', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Válido 30 días · un solo uso</p>
              <div className="rounded-lg px-3 py-2 text-left" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <p className="truncate" style={{ color: '#444444', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{inviteUrl}</p>
              </div>
              <button type="button" onClick={handleCopy} className="btn-accent" style={{ width: '100%', justifyContent: 'center' }}>
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar link</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
