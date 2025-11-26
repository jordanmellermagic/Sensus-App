import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext'
import api from '../api'

function HomeButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-full bg-neutral-900 border border-neutral-700 text-sm font-medium hover:bg-neutral-800 transition"
    >
      {children}
    </button>
  )
}

export default function DashboardPage() {
  const { userId, logout } = useAuth()
  const navigate = useNavigate()

  const handleResetApp = async () => {
    const ok = window.confirm(
      'Reset App will clear all spectator data, notes, screen data, and commands. Continue?',
    )
    if (!ok) return
    try {
      await api.post(`/clear_all/${encodeURIComponent(userId)}`)
      // No further action needed; pages will load empty data next time.
    } catch (err) {
      console.error('Failed to clear all data', err)
      window.alert('Failed to reset app. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold tracking-[0.3em] uppercase mb-1">
          SENSUS
        </h1>
        <div className="text-xs text-neutral-500">
          Logged in as <span className="text-neutral-300">{userId}</span>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={logout}
          className="px-4 py-1.5 rounded-full border border-neutral-700 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          Log Out
        </button>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <HomeButton onClick={() => navigate('/peek')}>Peek Screen</HomeButton>
        <HomeButton onClick={() => navigate('/spectator-data')}>
          Spectator Data
        </HomeButton>
      </div>

      <div className="flex flex-col items-center gap-4">
        <HomeButton onClick={() => navigate('/settings')}>Settings</HomeButton>
        <button
          onClick={handleResetApp}
          className="px-6 py-3 rounded-full bg-red-700 border border-red-500 text-sm font-medium hover:bg-red-600 transition"
        >
          Reset App
        </button>
      </div>
    </div>
  )
}
