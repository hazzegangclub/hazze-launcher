import { useState, useEffect } from 'react'
import AuthModal    from './components/AuthModal'
import UpdateModal  from './components/UpdateModal'
import LauncherHome from './pages/LauncherHome'

const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8080'

/** Restaura nickname e player_id do servidor se ainda não estiverem no localStorage */
async function restoreSession() {
  const token = localStorage.getItem('auth_bearer_token')
  if (!token) return

  try {
    // 1. /v1/auth/me — pega sub e player_id do JWT
    const meRes = await fetch(`${BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!meRes.ok) return
    const me = await meRes.json()
    const playerId = me.player_id ?? me.sub ?? ''
    if (!playerId) return

    if (!localStorage.getItem('auth_player_id'))
      localStorage.setItem('auth_player_id', playerId)

    // 2. /v1/players/{id} — pega displayName (nickname)
    if (!localStorage.getItem('auth_nickname')) {
      const pRes = await fetch(`${BASE}/v1/players/${playerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (pRes.ok) {
        const player = await pRes.json()
        const name = player.displayName ?? player.nickname ?? player.name ?? ''
        if (name) localStorage.setItem('auth_nickname', name)
      }
    }
  } catch { /* silencioso — não bloqueia o launcher */ }
}

export default function App() {
  const [showAuth, setShowAuth]     = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem('auth_bearer_token'))
  )

  // Restaura nickname/player_id assim que o app carrega
  useEffect(() => { restoreSession() }, [])

  function handleAuthClose() {
    setShowAuth(false)
    setIsLoggedIn(Boolean(localStorage.getItem('auth_bearer_token')))
  }

  function handleLogout() {
    localStorage.removeItem('auth_bearer_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_email')
    localStorage.removeItem('auth_nickname')
    localStorage.removeItem('auth_player_id')
    setIsLoggedIn(false)
  }

  const el = (window as unknown as { electron?: { isElectron: boolean; minimize: () => void; maximize: () => void; close: () => void } }).electron

  return (
    <div className="flex flex-col h-screen w-screen bg-hazze-dark text-white overflow-hidden font-sans select-none">
      {/* ── Titlebar ─────────────────────────────────────────────────────── */}
      <div
        className="h-8 flex-shrink-0 bg-black/40 flex items-center px-4 gap-3 z-50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <img
          src="/logo.png"
          alt="Hazze Gang Club"
          className="h-5 object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = 'none'
            const span = document.createElement('span')
            span.className = 'text-[11px] font-bold text-white/70 tracking-widest uppercase'
            span.textContent = 'Hazze Gang Club'
            el.parentElement?.insertBefore(span, el.nextSibling)
          }}
        />
        <span className="text-[10px] text-white/20">Launcher v1.0.0</span>
        <div className="flex-1" />
        {el?.isElectron && (
          <div className="flex gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button onClick={el.minimize} className="w-3 h-3 rounded-full bg-yellow-400 hover:brightness-125" />
            <button onClick={el.maximize} className="w-3 h-3 rounded-full bg-green-400 hover:brightness-125" />
            <button onClick={el.close}    className="w-3 h-3 rounded-full bg-red-400 hover:brightness-125" />
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <LauncherHome
          isLoggedIn={isLoggedIn}
          onAuthClick={() => setShowAuth(true)}
          onLogout={handleLogout}
        />
      </div>

      {showAuth && <AuthModal onClose={handleAuthClose} />}
      <UpdateModal />
    </div>
  )
}
