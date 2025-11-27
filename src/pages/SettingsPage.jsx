import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext.jsx'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage('')
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.')
      return
    }
    setMessage('Password updated (demo only, no server call).')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          Settings
        </h1>
        <Link
          to="/dashboard"
          className="text-xs text-neutral-400 hover:text-white"
        >
          Back to dashboard
        </Link>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-xl mx-auto space-y-6">
        <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold">Change password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            {message && (
              <p className="text-xs text-neutral-300">{message}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-medium transition-colors"
            >
              Update password
            </button>
          </form>
        </section>

        <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold">Session</h2>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/70 text-red-400 hover:bg-red-500/10 py-2.5 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </section>
      </main>
    </div>
  )
}
