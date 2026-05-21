import { useState } from 'react'
import AuthModal    from './components/AuthModal'
import UpdateModal  from './components/UpdateModal'
import LauncherHome from './pages/LauncherHome'

export default function App() {
  const [showAuth, setShowAuth]     = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem('auth_bearer_token'))
  )

  function handleAuthClose() {
    setShowAuth(false)
    setIsLoggedIn(Boolean(localStorage.getItem('auth_bearer_token')))
  }

  function handleLogout() {
    localStorage.removeItem('auth_bearer_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_email')
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
