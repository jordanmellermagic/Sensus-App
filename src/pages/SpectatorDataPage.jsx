import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../authContext'

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

  const fetchData = async () => {
    try {
      const res = await api.get(`/data_peek/${encodeURIComponent(userId)}`)
      setData(res.data || {})
    } catch (err) {
      console.error('Failed to load data_peek', err)
      setData({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
      <div className="w-full max-w-md mx-auto text-center text-neutral-400">
        Loading…
      </div>
    )
  }

  const birthdayText = data?.birthday || '—'
  const addressText = data?.address || 'No address on file.'

  return (
    <div className="w-full max-w-md mx-auto">
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

      <div className="space-y-4 text-sm">
        <div>
          <div className="text-neutral-500 text-xs uppercase">Full Name</div>
          <div className="text-neutral-100">
            {formatFullName(data?.first_name, data?.last_name)}
          </div>
        </div>
        <div>
          <div className="text-neutral-500 text-xs uppercase">
            Phone Number
          </div>
          <div className="text-neutral-100">
            {data?.phone_number || '—'}
          </div>
        </div>
        <div>
          <div className="text-neutral-500 text-xs uppercase">Birthday</div>
          <div className="text-neutral-100 mb-1">{birthdayText}</div>
          {/* Placeholder for intelligent dropdown calculations in a later iteration */}
        </div>
        <div>
          <div className="text-neutral-500 text-xs uppercase">Address</div>
          <div className="text-neutral-100">{addressText}</div>
        </div>
      </div>
    </div>
  )
}
