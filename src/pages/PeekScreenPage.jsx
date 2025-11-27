import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendSpectatorCommand } from '../api.js'

export default function PeekScreenPage() {
  const navigate = useNavigate()
  const [overlayVisible, setOverlayVisible] = useState(false)
  const holdTimerRef = useRef(null)
  const tapTimerRef = useRef(null)
  const tapCountRef = useRef(0)

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    }
  }, [])

  const clearHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  const handlePointerDown = () => {
    clearHold()
    holdTimerRef.current = setTimeout(() => {
      setOverlayVisible(true)
      if (navigator.vibrate) navigator.vibrate(200)
    }, 350)
  }

  const handlePointerUp = () => {
    if (overlayVisible) {
      setOverlayVisible(false)
      clearHold()
      return
    }

    clearHold()
    tapCountRef.current += 1

    if (!tapTimerRef.current) {
      tapTimerRef.current = setTimeout(async () => {
        const taps = tapCountRef.current
        tapCountRef.current = 0
        tapTimerRef.current = null

        try {
          if (taps === 2) {
            await sendSpectatorCommand('screenshot')
          } else if (taps === 3) {
            await sendSpectatorCommand('finishEffect')
            navigate('/dashboard')
          }
        } catch (err) {
          console.error('Command failed', err)
        }
      }, 300)
    }
  }

  const handlePointerLeave = () => {
    clearHold()
    setOverlayVisible(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          Peek Screen
        </h1>
        <Link
          to="/dashboard"
          className="text-xs text-neutral-400 hover:text-white"
        >
          Back to dashboard
        </Link>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div
          className="relative bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 h-[70vh] flex flex-col"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <div className="flex items-start justify-between text-xs md:text-sm mb-4 gap-3">
            <div className="space-y-1">
              <p className="text-neutral-400 uppercase tracking-[0.2em]">
                Note
              </p>
              <p className="font-medium text-white/90">
                Long press to reveal overlay.
              </p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-neutral-400 uppercase tracking-[0.2em]">
                URL
              </p>
              <p className="text-white/80">Hidden until overlay is shown.</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-neutral-400 uppercase tracking-[0.2em]">
                Contact
              </p>
              <p className="text-white/80">Spectator linked contact.</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-3xl aspect-video rounded-2xl border border-neutral-800 bg-neutral-950/70 overflow-hidden flex items-center justify-center">
              <p className="text-sm md:text-base text-neutral-500">
                Screenshot preview will appear here.
              </p>

              {overlayVisible && (
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-blue-500/70 flex items-center justify-center">
                  <div className="text-center space-y-2 px-4">
                    <p className="text-xs md:text-sm text-neutral-300 uppercase tracking-[0.25em]">
                      Overlay Revealed
                    </p>
                    <p className="text-sm md:text-base text-neutral-100">
                      Release to hide overlay.
                    </p>
                    <p className="text-xs text-neutral-400 mt-2">
                      Double tap → send screenshot • Triple tap → finish effect
                      &amp; return
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-xs md:text-sm text-neutral-400 flex flex-wrap gap-3 justify-center">
            <span>Press &amp; hold (350ms+) → reveal overlay + vibration</span>
            <span>•</span>
            <span>Release → hide overlay</span>
            <span>•</span>
            <span>Double tap → send "screenshot"</span>
            <span>•</span>
            <span>Triple tap → send "finishEffect" &amp; go home</span>
          </div>
        </div>
      </main>
    </div>
  )
}
