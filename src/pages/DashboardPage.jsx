import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext.jsx'
import api from '../api.js'

function RectButton({ children, onClick, variant = 'default', className = '' }) {
  const base =
    'h-12 px-5 rounded-xl text-[15px] font-medium transition border text-center flex items-center justify-center'
  const variants = {
    default:
      base +
      ' bg-neutral-900 border-neutral-700 text-neutral-50 hover:bg-neutral-800',
    danger:
      base +
      ' bg-neutral-900 border-red-600 text-red-300 hover:bg-red-700/40',
  }
  return (
    <button onClick={onClick} className={variants[variant] + ' ' + className}>
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
      window.alert('App reset. Data cleared.')
    } catch (err) {
      console.error(err)
      window.alert('Failed to reset app.')
    }
  }

  return (
    <div className="w-full min-h-screen px-6 pb-8 flex flex-col items-center justify-center bg-black">

      {/* LOGO */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold tracking-[0.3em] uppercase text-neutral-100">
          SENSUS
        </h1>
        <div className="text-xs text-neutral-500 mt-1">
          Logged in as <span className="text-neutral-200">{userId}</span>
        </div>
      </div>

      {/* PEEKS SECTION */}
      <div className="w-full max-w-sm">
        <div className="text-center text-xs tracking-wide text-neutral-500 mb-3">
          Peeks
        </div>
        <div className="flex justify-center gap-4 mb-12">
          <RectButton className="w-40" onClick={() => navigate('/peek')}>
            Peek Screen
          </RectButton>
          <RectButton className="w-40" onClick={() => navigate('/spectator-data')}>
            Spectator Data
          </RectButton>
        </div>

        {/* APP CONTROLS */}
        <div className="text-center text-xs tracking-wide text-neutral-500 mb-3">
          App Controls
        </div>
        <div className="flex justify-center gap-4 mb-10">
          <RectButton className="w-40" onClick={() => navigate('/settings')}>
            Settings
          </RectButton>
          <RectButton variant="danger" className="w-40" onClick={handleResetApp}>
            Reset App
          </RectButton>
        </div>

        {/* LOGOUT */}
        <div className="flex justify-center mt-4">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg text-sm border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
