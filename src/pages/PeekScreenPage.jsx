import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api.js'
import { useAuth } from '../authContext.jsx'
import { parseUrlInfo } from '../urlUtils.js'

function usePollingData(userId, intervalMs = 1500) {
  const [noteData, setNoteData] = useState(null)
  const [screenData, setScreenData] = useState(null)
  const prevNoteRef = useRef(null)
  const prevScreenRef = useRef(null)
  const [heroSource, setHeroSource] = useState(null)

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

        if (noteChanged && !screenChanged) {
          setHeroSource('note')
        } else if (screenChanged && !noteChanged) {
          setHeroSource('screen')
        } else if (noteChanged && screenChanged) {
          setHeroSource('screen')
        } else if (!heroSource) {
          if (screen?.screenshot_path || screen?.url || screen?.contact) {
            setHeroSource('screen')
          } else if (note?.note_name || note?.note_body) {
            setHeroSource('note')
          }
        }

        prevNoteRef.current = note
        prevScreenRef.current = screen
        setNoteData(note)
        setScreenData(screen)
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
  }, [userId, intervalMs, heroSource])

  return { noteData, screenData, heroSource }
}

function vibrate(pattern = 50) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // ignore
    }
  }
}

export default function PeekScreenPage() {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [revealing, setRevealing] = useState(false)
  const [tapTimes, setTapTimes] = useState([])
  const touchStartRef = useRef(null)
  const [isTwoFingerGesture, setIsTwoFingerGesture] = useState(false)
  const { noteData, screenData, heroSource } = usePollingData(userId)
  const tapTimeoutRef = useRef(null)

  const handlePointerDown = () => {
    setRevealing(true)
  }

  const handlePointerUp = () => {
    setRevealing(false)
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

  const hasScreenshot = !!screenData?.screenshot_path
  const hasUrl = !!screenData?.url
  const hasNote = !!(noteData?.note_name || noteData?.note_body)
  const hasContact = !!screenData?.contact

  let heroType = heroSource
  if (!heroType) {
    if (hasUrl || hasScreenshot || hasContact) heroType = 'screen'
    else if (hasNote) heroType = 'note'
  }

  const showCenterPreview =
    revealing && (hasScreenshot || hasUrl || hasNote || hasContact)

  const urlInfo = hasUrl ? parseUrlInfo(screenData.url) : { domain: null, search: null, page: null }

  return (
    <div
      className="w-full h-screen bg-black text-white relative touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={registerTap}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {revealing && (
        <div className="absolute inset-0">
          {hasNote && heroType !== 'note' && (
            <div className="absolute top-4 left-4 max-w-[45%] text-xs text-neutral-200 bg-black/60 px-2 py-1 rounded-md">
              {noteData?.note_name && (
                <div className="font-semibold mb-0.5">
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

          {hasContact && heroType !== 'contact' && (
            <div className="absolute top-4 right-4 max-w-[45%] text-xs text-right text-neutral-200 bg-black/60 px-2 py-1 rounded-md">
              <div className="font-semibold mb-0.5">Contact</div>
              <div className="text-neutral-300 break-words">
                {screenData.contact}
              </div>
            </div>
          )}

          {hasUrl && heroType !== 'screen' && (urlInfo.search || urlInfo.page || urlInfo.domain) && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 max-w-[80%] text-xs text-center text-neutral-200 bg-black/60 px-3 py-2 rounded-md">
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

          {showCenterPreview && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="max-w-full max-h-full">
                {heroType === 'screen' && (hasScreenshot || hasUrl || hasContact) && (
                  <div className="rounded-xl border border-neutral-700 bg-neutral-900/70 overflow-hidden max-w-md mx-auto px-4 py-4">
                    {hasUrl && (urlInfo.search || urlInfo.page || urlInfo.domain) && (
                      <div className="mb-3 text-sm text-neutral-100 text-center">
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
                          <div className="text-xs text-neutral-300">
                            <span className="mr-1">🌐</span>
                            <span>{urlInfo.domain}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {hasScreenshot && (
                      <img
                        src={`${api.defaults.baseURL}/screen_peek/${encodeURIComponent(
                          userId,
                        )}/screenshot?ts=${Date.now()}`}
                        alt="Screen peek"
                        className="block w-full h-auto max-h-[60vh] object-contain bg-black"
                      />
                    )}
                    {!hasScreenshot && !hasUrl && hasContact && (
                      <div className="text-sm text-neutral-200 whitespace-pre-wrap">
                        {screenData.contact}
                      </div>
                    )}
                    {!hasScreenshot && !hasUrl && !hasContact && (
                      <div className="px-4 py-6 text-center text-sm text-neutral-500">
                        No screen data yet.
                      </div>
                    )}
                  </div>
                )}

                {heroType === 'note' && hasNote && (
                  <div className="rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 max-w-md mx-auto">
                    {noteData?.note_name && (
                      <div className="font-semibold mb-1">
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

                {heroType === 'contact' && hasContact && (
                  <div className="rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 max-w-md mx-auto text-sm text-neutral-200">
                    <div className="font-semibold mb-1">Contact</div>
                    <div className="whitespace-pre-wrap break-words">
                      {screenData.contact}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
