import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLatestSpectator } from '../api.js'
import { normalizeUrl, truncateUrl, getDomainFromUrl } from '../urlUtils.js'

export default function SpectatorDataPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        const latest = await getLatestSpectator()
        if (!active) return
        setData(latest)
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load spectator data')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  const updatedAt = data?.updated_at
    ? new Date(data.updated_at)
    : null

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          Spectator Data
        </h1>
        <Link
          to="/dashboard"
          className="text-xs text-neutral-400 hover:text-white"
        >
          Back to dashboard
        </Link>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm text-neutral-400 uppercase tracking-[0.25em]">
                Live Spectator Widget
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold mt-2">
                Current Screen Context
              </h2>
            </div>
            <div className="text-right text-sm text-neutral-400">
              {updatedAt ? (
                <span>
                  Updated{' '}
                  {updatedAt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              ) : (
                <span>Awaiting first update…</span>
              )}
            </div>
          </div>

          {loading && (
            <p className="text-neutral-400 text-lg">Loading spectator data…</p>
          )}

          {error && (
            <p className="text-red-400 text-sm">Error: {error}</p>
          )}

          {data && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Note</p>
                  <p className="text-base md:text-lg leading-relaxed">
                    {data.note || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-400 mb-1">URL</p>
                  {data.url ? (
                    <a
                      href={normalizeUrl(data.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm md:text-base text-blue-400 hover:text-blue-300 break-all"
                    >
                      {truncateUrl(data.url, 60)}
                      <span className="ml-2 text-xs text-neutral-500">
                        ({getDomainFromUrl(data.url)})
                      </span>
                    </a>
                  ) : (
                    <p className="text-base md:text-lg">—</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-neutral-400 mb-1">Contact</p>
                  <p className="text-base md:text-lg">
                    {data.contact || '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-neutral-400 mb-1">Screenshot</p>
                <div className="aspect-video rounded-xl border border-neutral-800 bg-neutral-950/60 flex items-center justify-center overflow-hidden">
                  {data.screenshot_url ? (
                    <img
                      src={data.screenshot_url}
                      alt="Spectator screenshot"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-neutral-500">
                      No screenshot available
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
