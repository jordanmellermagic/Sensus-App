import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext.jsx'
import api from '../api.js'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { userId } = useAuth()

  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChangePw = async () => {
    if (!oldPw || !newPw) {
      alert('Please fill out both fields.')
      return
    }

    setLoading(true)
    try {
      await api.post(`/user/${encodeURIComponent(userId)}/change_password`, {
        old_password: oldPw,
        new_password: newPw,
      })
      alert('Password changed successfully.')
      setOldPw('')
      setNewPw('')
    } catch (err) {
      console.error(err)
      alert('Failed to change password.')
    }
    setLoading(false)
  }

  return (
    <div className="w-full min-h-screen bg-black px-6 pt-safe pb-safe text-neutral-100">
      <div className="max-w-md mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="text-xs text-neutral-400 hover:text-neutral-200 mt-6 mb-6"
        >
          ← Back
        </button>

        <h2 className="text-center text-xl font-medium mb-10">
          Settings
        </h2>

        <div className="space-y-6">

          <div>
            <label className="block text-neutral-400 text-sm mb-2">
              Old Password
            </label>
            <input
              type="password"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-100"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-sm mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-100"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            onClick={handleChangePw}
            className="w-full h-12 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 text-[15px] hover:bg-neutral-800"
          >
            Save Changes
          </button>

        </div>
      </div>
    </div>
  )
}
