import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api.js'
import { useAuth } from '../authContext.jsx'
import { parseUrlInfo } from '../urlUtils.js'

function getTs(obj, keys) {
  if (!obj) return null
  for (const k of keys) {
    if (obj[k]) {
      const t = Date.parse(obj[k])
      if (!Number.isNaN(t)) return t
    }
  }
  return null
}

function usePeekData(userId, intervalMs = 1500) {
  const [noteData, setNoteData] = useState(null)
  const [screenData, setScreenData] = useState(null)
  const [heroType, setHeroType] = useState(null)
  const prevNoteRef = useRef(null)
  const prevScreenRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const [noteRes, screenRes] = await Promise.all([
          api.get(`/note_peek/${encodeURIComponent(userId)}`),
          api.get(`/screen_peek/${encodeURIComponent(userId)}`),
        ])

        const note = noteRes.data || {}
        const screen = screenRes.data || {}

        if (cancelled) return

        const prevNote = prevNoteRef.current
        const prevScreen = prevScreenRef.current

        const noteChanged =
          JSON.stringify(prevNote || {}) !== JSON.stringify(note || {})
        const screenChanged =
          JSON.stringify(prevScreen || {}) !== JSON.stringify(screen || {})

        // Try timestamp-based hero first if available
        const noteTs = getTs(note, [
          'note_peek_updated_at',
          'updated_at',
          'note_updated_at',
        ])
        const screenTs = getTs(screen, [
          'screen_peek_updated_at',
          'updated_at',
        ])

        let nextHero = heroType

        if (noteTs || screenTs) {
          if (noteTs && !screenTs) nextHero = 'note'
          else if (!noteTs && screenTs) nextHero = 'screen'
          else if (noteTs && screenTs) {
            nextHero = noteTs >= screenTs ? 'note' : 'screen'
          }
        } else {
          // Fallback: changed-based
          if (screenChanged && !noteChanged) nextHero = 'screen'
          else if (noteChanged && !screenChanged) nextHero = 'note'
          else if (screenChanged && noteChanged) {
            // If both changed same poll, prefer screen data by default
            nextHero = 'screen'
          }
        }

        prevNoteRef.current = note
        prevScreenRef.current = screen

        setNoteData(note)
        setScreenData(screen)
        setHeroType(nextHero)
      } catch (err) {
        console.error('Polling failed', err)
      }
    }

    poll()
    const id = setInterval(poll, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [userId, intervalMs, heroType])

  return { noteData, screenData, heroType }
}

function vibrate(pattern = 50) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
    if (typeof window !== 'undefined' && window?.webkit?.messageHandlers?.hapticFeedback) {
      window.webkit.messageHandlers.hapticFeedback.postMessage('impact')
    }
  } catch {
    // ignore
  }
}

export default function PeekScreenPage() {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [revealing, setRevealing] = useState(false)
  const [tapTimes, setTapTimes] = useState([])
  const holdTimerRef = useRef(null)
  const didRevealRef = useRef(false)
  const tapTimeoutRef = useRef(null)
  const touchStartRef = useRef(null)
  const [isTwoFingerGesture, setIsTwoFingerGesture] = useState(false)

  const { noteData, screenData, heroType } = usePeekData(userId)

  const hasNote = !!(noteData?.note_name || noteData?.note_body)
  const hasUrl = !!screenData?.url
  const hasContact = !!screenData?.contact
  const hasScreenshot = !!screenData?.screenshot_path

  // Decide hero representation: note vs url vs contact vs screenshot
  let effectiveHero = heroType
  if (!effectiveHero) {
    if (hasScreenshot) effectiveHero = 'screen'
    else if (hasUrl || hasContact) effectiveHero = 'screen'
    else if (hasNote) effectiveHero = 'note'
  }

  // Inside "screen" hero, choose the primary content
  let screenHeroKind = null
  if (effectiveHero === 'screen') {
    if (hasScreenshot) screenHeroKind = 'screenshot'
    else if (hasUrl) screenHeroKind = 'url'
    else if (hasContact) screenHeroKind = 'contact'
  }

  // If heroType says "note" but note is missing, fall back
  if (effectiveHero === 'note' && !hasNote) {
    if (hasScreenshot || hasUrl || hasContact) {
      effectiveHero = 'screen'
      if (hasScreenshot) screenHeroKind = 'screenshot'
      else if (hasUrl) screenHeroKind = 'url'
      else if (hasContact) screenHeroKind = 'contact'
    }
  }

  const urlInfo = hasUrl ? parseUrlInfo(screenData.url) : { domain: null, search: null, page: null }
  const showAnything = hasNote || hasUrl || hasContact || hasScreenshot

  // --- Press & hold with 120ms delay ---
  const handlePointerDown = () => {
    didRevealRef.current = false
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
    }
    holdTimerRef.current = setTimeout(() => {
      didRevealRef.current = true
      setRevealing(true)
    }, 120)
  }

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    // If we were in reveal mode, stop revealing and do NOT count taps
    if (didRevealRef.current) {
      didRevealRef.current = false
      setRevealing(false)
      return
    }
    // Otherwise, treat as tap
    registerTap()
  }

  const registerTap = () => {
    const now = Date.now()
    const recent = tapTimes.filter((t) => now - t < 600)
    recent.push(now)
    setTapTimes(recent)

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current)
      tapTimeoutRef.current = null
    }

    tapTimeoutRef.current = setTimeout(async () => {
      const len = recent.length
      setTapTimes([])
      tapTimeoutRef.current = null

      if (len >= 3) {
        vibrate(60)
        try {
          await api.post(`/commands/${encodeURIComponent(userId)}`, {
            command: 'finishEffect',
          })
        } catch (err) {
          console.error('Failed to send finishEffect', err)
        }
      } else if (len === 2) {
        vibrate(40)
        try {
          await api.post(`/commands/${encodeURIComponent(userId)}`, {
            command: 'screenshot',
          })
        } catch (err) {
          console.error('Failed to send screenshot command', err)
        }
      }
    }, 250)
  }

  // Two-finger swipe down to exit
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setIsTwoFingerGesture(true)
      touchStartRef.current = {
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    }
  }

  const handleTouchMove = (e) => {
    if (isTwoFingerGesture && e.touches.length === 2 && touchStartRef.current) {
      const currentY =
        (e.touches[0].clientY + e.touches[1].clientY) / 2
      const deltaY = currentY - touchStartRef.current.y
      if (deltaY > 80) {
        setIsTwoFingerGesture(false)
        touchStartRef.current = null
        navigate('/', { replace: true })
      }
    }
  }

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setIsTwoFingerGesture(false)
      touchStartRef.current = null
    }
  }

  return (
    <div
      className="w-full h-screen bg-black text-white relative touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {revealing && showAnything && (
        <div className="absolute inset-0">
          {/* Small fixed positions */}
          {hasNote && effectiveHero !== 'note' && (
            <div className="absolute top-4 left-4 max-w-[45%] text-[13px] text-neutral-200 bg-black/80 px-2 py-1 rounded-md">
              <div className="font-semibold text-[13px] mb-0.5">Note</div>
              {noteData?.note_name && (
                <div className="font-medium mb-0.5">
                  {noteData.note_name}
                </div>
              )}
              {noteData?.note_body && (
                <div className="text-neutral-300 line-clamp-2">
                  {noteData.note_body}
                </div>
              )}
            </div>
          )}

          {hasUrl && !(effectiveHero === 'screen' && screenHeroKind === 'url') && (urlInfo.search || urlInfo.page || urlInfo.domain) && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-[70%] text-[13px] text-center text-neutral-200 bg-black/80 px-3 py-2 rounded-md">
              {urlInfo.search && (
                <div className="mb-1">
                  <span className="mr-1">🔍</span>
                  <span>{urlInfo.search}</span>
                </div>
              )}
              {!urlInfo.search && urlInfo.page && (
                <div className="mb-1">
                  <span className="mr-1">📄</span>
                  <span>{urlInfo.page}</span>
                </div>
              )}
              {urlInfo.domain && (
                <div>
                  <span className="mr-1">🌐</span>
                  <span>{urlInfo.domain}</span>
                </div>
              )}
            </div>
          )}

          {hasContact && !(effectiveHero === 'screen' && screenHeroKind === 'contact') && (
            <div className="absolute top-4 right-4 max-w-[45%] text-[13px] text-right text-neutral-200 bg-black/80 px-2 py-1 rounded-md">
              <div className="font-semibold mb-0.5 text-[13px]">Contact</div>
              <div className="text-neutral-300 break-words">
                {screenData.contact}
              </div>
            </div>
          )}

          {hasScreenshot && !(effectiveHero === 'screen' && screenHeroKind === 'screenshot') && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32">
              <img
                src={`${api.defaults.baseURL}/screen_peek/${encodeURIComponent(
                  userId,
                )}/screenshot?thumb=1&v=${Date.now()}`}
                alt="Screen peek"
                className="w-full h-auto object-contain rounded-md border border-neutral-700 bg-black"
              />
            </div>
          )}

          {/* HERO in center (medium size ~70% width) */}
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="max-w-[70vw] max-h-[70vh]">
              {effectiveHero === 'screen' && screenHeroKind === 'screenshot' && hasScreenshot && (
                <div className="rounded-xl border border-neutral-700 bg-neutral-900/70 overflow-hidden">
                  <img
                    src={`${api.defaults.baseURL}/screen_peek/${encodeURIComponent(
                      userId,
                    )}/screenshot?v=${Date.now()}`}
                    alt="Screen peek"
                    className="block w-full h-auto max-h-[70vh] object-contain bg-black"
                  />
                </div>
              )}

              {effectiveHero === 'note' && hasNote && (
                <div className="rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3">
                  <div className="font-semibold text-sm mb-1">Note</div>
                  {noteData?.note_name && (
                    <div className="font-semibold mb-1 text-sm">
                      {noteData.note_name}
                    </div>
                  )}
                  {noteData?.note_body && (
                    <div className="text-sm text-neutral-200 whitespace-pre-wrap">
                      {noteData.note_body}
                    </div>
                  )}
                </div>
              )}

              {effectiveHero === 'screen' && screenHeroKind === 'url' && hasUrl && (
                <div className="rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-center text-sm text-neutral-100">
                  {urlInfo.search && (
                    <div className="mb-2">
                      <span className="mr-1">🔍</span>
                      <span>{urlInfo.search}</span>
                    </div>
                  )}
                  {!urlInfo.search && urlInfo.page && (
                    <div className="mb-2">
                      <span className="mr-1">📄</span>
                      <span>{urlInfo.page}</span>
                    </div>
                  )}
                  {urlInfo.domain && (
                    <div className="text-xs text-neutral-300">
                      <span className="mr-1">🌐</span>
                      <span>{urlInfo.domain}</span>
                    </div>
                  )}
                </div>
              )}

              {effectiveHero === 'screen' && screenHeroKind === 'contact' && hasContact && (
                <div className="rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-neutral-200">
                  <div className="font-semibold mb-1">Contact</div>
                  <div className="whitespace-pre-wrap break-words">
                    {screenData.contact}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
