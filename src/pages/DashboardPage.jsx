import React from 'react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          Sensus Dashboard
        </h1>
        <span className="text-xs text-neutral-400 uppercase tracking-[0.2em]">
          Live Spectator
        </span>
      </header>

      <main className="px-4 md:px-8 py-6 space-y-6 max-w-4xl mx-auto">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
            <p className="text-xs text-neutral-400 mb-1">Active Session</p>
            <p className="text-2xl font-semibold">Live</p>
          </div>
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
            <p className="text-xs text-neutral-400 mb-1">Last Peek</p>
            <p className="text-2xl font-semibold">Moments ago</p>
          </div>
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
            <p className="text-xs text-neutral-400 mb-1">Spectator</p>
            <p className="text-2xl font-semibold">Ready</p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/spectator"
            className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500 transition-colors"
          >
            <div>
              <p className="text-xs text-neutral-400 mb-1">Spectator</p>
              <p className="font-semibold">Live Data</p>
            </div>
            <span className="mt-3 text-xs text-neutral-500">
              View note, URL, contact & screenshot.
            </span>
          </Link>

          <Link
            to="/peek"
            className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500 transition-colors"
          >
            <div>
              <p className="text-xs text-neutral-400 mb-1">Peek</p>
              <p className="font-semibold">Gesture Screen</p>
            </div>
            <span className="mt-3 text-xs text-neutral-500">
              Press & hold, double & triple tap.
            </span>
          </Link>

          <Link
            to="/settings"
            className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500 transition-colors"
          >
            <div>
              <p className="text-xs text-neutral-400 mb-1">Settings</p>
              <p className="font-semibold">Security</p>
            </div>
            <span className="mt-3 text-xs text-neutral-500">
              Manage password & logout.
            </span>
          </Link>
        </section>
      </main>
    </div>
  )
}
