import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api.js'
import { useAuth } from '../authContext.jsx'
import { computeExtras } from '../birthdayUtils.js'

function formatFullName(first, last) {
  if (first && last) return first + ' ' + last
  if (first) return first
  if (last) return last
  return '—'
}

export default function SpectatorDataPage() {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showExtras, setShowExtras] = useState(false)

  const fetchData = async () => {
    try {
      const res = await api.get(`/data_peek/${encodeURIComponent(userId)}`)
      setData(res.data || {})
      setLoading(false)
    } catch (err) {
      console.error('Failed to load data_peek', err)
      setData({})
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchData()
    const id = setInterval(fetchData, 1500)
    return () => clearInterval(id)
  }, [userId])

  const handleClear = async () => {
    const ok = window.confirm(
      'Clear spectator data (name, phone, birthday, address)?',
    )
    if (!ok) return
    try {
      await api.post(`/data_peek/${encodeURIComponent(userId)}/clear`)
      fetchData()
    } catch (err) {
      console.error('Failed to clear spectator data', err)
      window.alert('Failed to clear spectator data')
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto pt-6 text-center text-neutral-400">
        Loading…
      </div>
    )
  }

  const birthdayText = data?.birthday || '—'
  const addressText = data?.address || 'No address on file.'
  const extras = computeExtras(data?.birthday)
  const hasExtras =
    !!extras.starSign ||
    (extras.hasYear && (extras.daysAlive != null || extras.weekday))

  return (
    <div className="w-full max-w-md mx-auto pt-6 pb-8">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          ← Home
        </button>
        <button
          onClick={handleClear}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Clear
        </button>
      </div>

      <h2 className="text-center text-lg font-medium mb-6">
        Spectator Data
      </h2>

      <div className="space-y-5 text-sm">
        <div>
          <div className="text-neutral-500 text-xs uppercase tracking-wide">
            Full Name
          </div>
          <div className="text-neutral-100 mt-1">
            {formatFullName(data?.first_name, data?.last_name)}
          </div>
        </div>

        <div>
          <div className="text-neutral-500 text-xs uppercase tracking-wide">
            Phone Number
          </div>
          <div className="text-neutral-100 mt-1">
            {data?.phone_number || '—'}
          </div>
        </div>

        <div>
          <div className="text-neutral-500 text-xs uppercase tracking-wide">
            Birthday
          </div>
          <div className="text-neutral-100 mt-1">{birthdayText}</div>

          {hasExtras && (
            <button
              type="button"
              onClick={() => setShowExtras((v) => !v)}
              className="mt-2 text-sm text-neutral-300 hover:text-neutral-100"
            >
              {showExtras ? 'Hide details' : 'Show more details'}
            </button>
          )}

          {showExtras && (
            <div className="mt-3 space-y-1 text-sm text-neutral-200">
              {extras.starSign && (
                <div>Star sign: {extras.starSign}</div>
              )}
              {extras.hasYear && extras.daysAlive != null && (
                <div>Days alive: {extras.daysAlive.toLocaleString()}</div>
              )}
              {extras.hasYear && extras.weekday && (
                <div>Day of week born: {extras.weekday}</div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="text-neutral-500 text-xs uppercase tracking-wide">
            Address
          </div>
          <div className="text-neutral-100 mt-1 whitespace-pre-wrap">
            {addressText}
          </div>
        </div>
      </div>
    </div>
  )
}
