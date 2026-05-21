import { useState, useEffect, useRef } from 'react'
import {
  Play, Download, RefreshCw, User, LogOut,
  Newspaper, Shield, Settings, X, Loader2,
} from 'lucide-react'
import { NEWS } from '../lib/api'

// ── Types ─────────────────────────────────────────────────────────────────
type GameStatus = 'not_installed' | 'downloading' | 'updating' | 'ready'
type NavPage    = 'home' | 'patch' | 'account' | 'settings'

interface Props {
  isLoggedIn: boolean
  onAuthClick: () => void
  onLogout: () => void
}

// ── Fake game install path (would come from electron IPC in a real app) ──
const GAME_EXE_KEY = 'hazze_game_installed'

export default function LauncherHome({ isLoggedIn, onAuthClick, onLogout }: Props) {
  const [nav, setNav]         = useState<NavPage>('home')
  const [status, setStatus]   = useState<GameStatus>(() =>
    localStorage.getItem(GAME_EXE_KEY) === '1' ? 'ready' : 'not_installed'
  )
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed]       = useState('')
  const [activeNews, setActiveNews] = useState(NEWS[0])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Simulated download/update
  function startDownload(isUpdate = false) {
    setStatus(isUpdate ? 'updating' : 'downloading')
    setProgress(0)
    let p = 0
    intervalRef.current = setInterval(() => {
      p += Math.random() * 2.5
      setSpeed(`${(Math.random() * 8 + 2).toFixed(1)} MB/s`)
      if (p >= 100) {
        p = 100; clearInterval(intervalRef.current!)
        setProgress(100); setSpeed('')
        setTimeout(() => {
          setStatus('ready')
          localStorage.setItem(GAME_EXE_KEY, '1')
        }, 400)
      }
      setProgress(Math.min(p, 100))
    }, 120)
  }

  function cancelDownload() {
    clearInterval(intervalRef.current!)
    setStatus('not_installed')
    setProgress(0)
    setSpeed('')
  }

  useEffect(() => () => clearInterval(intervalRef.current!), [])

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Left sidebar (icon nav) ─────────────────────────────────────── */}
      <aside className="w-12 flex flex-col items-center py-3 gap-1 bg-black/30 border-r border-white/5 flex-shrink-0">
        {([
          ['home',    Newspaper, 'Novidades'],
          ['account', User,      'Conta'],
          ['settings',Settings,  'Config'],
        ] as [NavPage, typeof Newspaper, string][]).map(([id, Icon, label]) => (
          <button
            key={id}
            title={label}
            onClick={() => setNav(id)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
              nav === id ? 'bg-hazze-pink/20 text-hazze-pink' : 'text-gray-600 hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </aside>

      {/* ── Main split ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL — News + Account */}
        <div className="w-[52%] flex flex-col border-r border-white/5 overflow-hidden">
          {nav === 'home'    && <NewsPanel activeNews={activeNews} onSelect={setActiveNews} />}
          {nav === 'account' && <AccountPanel isLoggedIn={isLoggedIn} onAuthClick={onAuthClick} onLogout={onLogout} />}
          {nav === 'settings'&& <SettingsPanel />}
        </div>

        {/* RIGHT PANEL — Game banner + play/download */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <GamePanel status={status} progress={progress} speed={speed}
            onDownload={() => startDownload(false)}
            onUpdate={() => startDownload(true)}
            onCancel={cancelDownload}
            isLoggedIn={isLoggedIn}
            onAuthClick={onAuthClick}
          />
        </div>
      </div>
    </div>
  )
}

// ── News Panel ─────────────────────────────────────────────────────────────
function NewsPanel({ activeNews, onSelect }: {
  activeNews: typeof NEWS[0]
  onSelect: (n: typeof NEWS[0]) => void
}) {
  const CATEGORY_STYLE = {
    patch:  { label: 'Patch',        color: 'bg-hazze-pink/20 text-hazze-pink border-hazze-pink/30' },
    event:  { label: 'Evento',       color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    update: { label: 'Atualização',  color: 'bg-hazze-cyan/20 text-hazze-cyan border-hazze-cyan/30' },
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Novidades</span>
      </div>

      {/* Active news detail */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {activeNews && (() => {
          const { label, color } = CATEGORY_STYLE[activeNews.category]
          const lines = activeNews.body.split('\n').map((line, i) => {
            if (line.startsWith('•'))
              return <li key={i} className="ml-4 list-disc text-gray-300">{line.slice(1).trim()}</li>
            if (!line) return <br key={i} />
            // Render **bold** inline
            const parts = line.split(/(\*\*[^*]+\*\*)/)
            const rendered = parts.map((p, j) =>
              p.startsWith('**') && p.endsWith('**')
                ? <strong key={j} className="text-white font-bold">{p.slice(2, -2)}</strong>
                : <span key={j}>{p}</span>
            )
            return <p key={i}>{rendered}</p>
          })
          return (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${color}`}>{label}</span>
                <span className="text-[11px] text-gray-600">{new Date(activeNews.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <h2 className="text-base font-black text-white mb-3">{activeNews.title}</h2>
              <div className="text-xs text-gray-400 leading-relaxed space-y-0.5">{lines}</div>
            </div>
          )
        })()}
      </div>

      {/* News list thumbnails */}
      <div className="border-t border-white/5 flex-shrink-0">
        <div className="flex flex-col divide-y divide-white/5">
          {NEWS.map(item => {
            const { label, color } = CATEGORY_STYLE[item.category]
            return (
              <button key={item.id} onClick={() => onSelect(item)}
                className={`text-left px-4 py-2.5 flex items-start gap-3 hover:bg-white/3 transition ${activeNews.id === item.id ? 'bg-hazze-pink/5' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${activeNews.id === item.id ? 'bg-hazze-pink' : 'bg-white/10'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 rounded border ${color}`}>{label}</span>
                    <span className="text-[10px] text-gray-600">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Game Panel ─────────────────────────────────────────────────────────────
function GamePanel({ status, progress, speed, onDownload, onUpdate, onCancel, isLoggedIn, onAuthClick }: {
  status: GameStatus; progress: number; speed: string
  onDownload: () => void; onUpdate: () => void; onCancel: () => void
  isLoggedIn: boolean; onAuthClick: () => void
}) {
  const isWorking = status === 'downloading' || status === 'updating'
  const label     = status === 'downloading' ? 'Baixando' : status === 'updating' ? 'Atualizando' : ''

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background: BANNER LAUNCHER se disponível, senão gradiente */}
        <img
          src="/banner.png"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {/* Fallback gradient (visível quando não tem banner) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0010] via-[#1a0030] to-[#000818] -z-10" />

        {/* Escurecimento suave para legibilidade */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Logo centralizado */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/logo.png"
            alt="Hazze Gang Club"
            className="w-48 object-contain drop-shadow-2xl"
            onError={(e) => {
              // fallback: texto se imagem não existir
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              const parent = el.parentElement
              if (parent) {
                parent.innerHTML = '<div class="text-center"><div class="text-2xl font-black text-white leading-none">HAZZE GANG CLUB</div><div class="text-[10px] tracking-[0.4em] font-bold mt-1" style="color:#e91e8c">STRIKERS</div></div>'
              }
            }}
          />
        </div>

        {/* Gradiente para fundir com a action area abaixo */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-hazze-dark to-transparent" />
      </div>

      {/* Action area */}
      <div className="flex-shrink-0 px-5 pb-5 pt-3 bg-hazze-dark">
        {/* Status / Progress */}
        {isWorking && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-hazze-pink" />
                {label}…  {Math.round(progress)}%
              </span>
              <span className="text-gray-600">{speed}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-hazze-pink rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {status === 'ready' && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Jogo instalado · v1.0.0</span>
            <button onClick={onUpdate} className="ml-auto text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Verificar atualização
            </button>
          </div>
        )}

        {status === 'not_installed' && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            <span className="text-xs text-gray-600">Jogo não instalado · ~2 GB</span>
          </div>
        )}

        {/* Main button */}
        <div className="flex gap-2">
          {status === 'not_installed' && (
            <button
              onClick={isLoggedIn ? onDownload : onAuthClick}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-hazze-pink text-white font-black text-base rounded-xl hover:brightness-110 active:scale-95 transition shadow-lg shadow-hazze-pink/20"
            >
              <Download className="w-5 h-5" />
              {isLoggedIn ? 'Baixar Jogo' : 'Entrar para Baixar'}
            </button>
          )}

          {isWorking && (
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-gray-400 font-bold text-sm rounded-xl hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          )}

          {status === 'ready' && (
            <>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-hazze-pink text-white font-black text-base rounded-xl hover:brightness-110 active:scale-95 transition shadow-lg shadow-hazze-pink/20"
              >
                <Play className="w-5 h-5 fill-white" /> Jogar
              </button>
              <button
                onClick={onUpdate}
                title="Verificar atualização"
                className="w-12 flex items-center justify-center border border-white/10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Login nudge */}
        {!isLoggedIn && status !== 'not_installed' && (
          <button onClick={onAuthClick}
            className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-white border border-white/5 rounded-lg flex items-center justify-center gap-1.5 transition">
            <User className="w-3 h-3" /> Entrar ou criar conta
          </button>
        )}
      </div>
    </div>
  )
}

// ── Account Panel ──────────────────────────────────────────────────────────
function AccountPanel({ isLoggedIn, onAuthClick, onLogout }: {
  isLoggedIn: boolean; onAuthClick: () => void; onLogout: () => void
}) {
  const email = localStorage.getItem('auth_email') ?? ''
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <p className="font-bold text-white mb-1">Faça login na sua conta</p>
          <p className="text-xs text-gray-500">Necessário para jogar e receber recompensas.</p>
        </div>
        <button onClick={onAuthClick}
          className="px-6 py-2.5 bg-hazze-pink text-white font-bold rounded-lg hover:brightness-110 transition text-sm">
          Entrar / Criar Conta
        </button>
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conta</span>
      <div className="bg-hazze-dark border border-white/5 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-hazze-pink/20 border border-hazze-pink/30 flex items-center justify-center">
          <User className="w-5 h-5 text-hazze-pink" />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{email || 'Jogador'}</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Online
          </p>
        </div>
      </div>
      <button onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2.5 border border-white/5 text-gray-500 hover:text-white rounded-lg text-sm transition mt-auto">
        <LogOut className="w-4 h-4" /> Sair da conta
      </button>
    </div>
  )
}

// ── Settings Panel ─────────────────────────────────────────────────────────
function SettingsPanel() {
  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Configurações</span>
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <div>
          <p className="text-sm text-white">API Gateway</p>
          <p className="text-xs text-gray-600">http://127.0.0.1:8080</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400" title="Conectado" />
      </div>
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <p className="text-sm text-white">Launcher</p>
        <span className="text-xs text-gray-600">v1.0.0</span>
      </div>
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <p className="text-sm text-white">Jogo</p>
        <span className="text-xs text-gray-600">
          {localStorage.getItem('hazze_game_installed') === '1' ? 'v1.0.0 instalado' : 'Não instalado'}
        </span>
      </div>
    </div>
  )
}
