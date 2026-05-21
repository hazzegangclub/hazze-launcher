import { useState, useEffect } from 'react'
import { Download, RefreshCw, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type UpdateState =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'available'; version: string }
  | { phase: 'downloading'; percent: number; speed: number }
  | { phase: 'ready'; version: string }
  | { phase: 'error'; message: string }

type ElectronBridge = {
  isElectron?: boolean
  onUpdateChecking?: (cb: () => void) => void
  onUpdateAvailable?: (cb: (v: { version: string }) => void) => void
  onUpdateNone?: (cb: (v: { version: string }) => void) => void
  onUpdateProgress?: (cb: (v: { percent: number; speed: number }) => void) => void
  onUpdateReady?: (cb: (v: { version: string }) => void) => void
  onUpdateError?: (cb: (v: { message: string }) => void) => void
  installUpdate?: () => void
  checkForUpdates?: () => void
}

function getElectron(): ElectronBridge {
  return (window as unknown as { electron?: ElectronBridge }).electron ?? {}
}

function fmtSpeed(bps: number) {
  if (bps > 1_000_000) return `${(bps / 1_000_000).toFixed(1)} MB/s`
  if (bps > 1_000)     return `${(bps / 1_000).toFixed(0)} KB/s`
  return `${bps} B/s`
}

export default function UpdateModal() {
  const [state, setState] = useState<UpdateState>({ phase: 'idle' })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const el = getElectron()
    if (!el.isElectron) return

    el.onUpdateChecking?.(() => setState({ phase: 'checking' }))

    el.onUpdateAvailable?.((v) => setState({ phase: 'available', version: v.version }))

    el.onUpdateNone?.(() => setState({ phase: 'idle' }))

    el.onUpdateProgress?.((v) =>
      setState({ phase: 'downloading', percent: v.percent, speed: v.speed })
    )

    el.onUpdateReady?.((v) => setState({ phase: 'ready', version: v.version }))

    el.onUpdateError?.((v) => setState({ phase: 'error', message: v.message }))
  }, [])

  // Nothing to show
  if (state.phase === 'idle' || dismissed) return null

  // Just a subtle spinner while checking
  if (state.phase === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-hazze-panel border border-white/5 rounded-lg text-xs text-gray-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        Verificando atualizações…
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-hazze-panel border border-white/10 rounded-2xl p-6 shadow-2xl">

        {/* Close (só no estado available/error) */}
        {(state.phase === 'available' || state.phase === 'error') && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 text-gray-600 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ── Atualização disponível ─────────────────────────────── */}
        {state.phase === 'available' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-hazze-pink/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-hazze-pink" />
              </div>
              <div>
                <p className="font-bold text-white">Nova versão disponível</p>
                <p className="text-xs text-gray-500">v{state.version}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              O download está sendo feito automaticamente em segundo plano.
            </p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Baixando…
              </span>
              <button onClick={() => setDismissed(true)} className="text-gray-600 hover:text-gray-400">
                Minimizar
              </button>
            </div>
          </>
        )}

        {/* ── Download em progresso ─────────────────────────────── */}
        {state.phase === 'downloading' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-hazze-pink/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-hazze-pink animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-white">Baixando atualização</p>
                <p className="text-xs text-gray-500">{state.percent}% · {fmtSpeed(state.speed)}</p>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-hazze-pink rounded-full transition-all duration-300"
                style={{ width: `${state.percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 text-right">{state.percent}%</p>
          </>
        )}

        {/* ── Pronto para instalar ──────────────────────────────── */}
        {state.phase === 'ready' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white">Atualização pronta!</p>
                <p className="text-xs text-gray-500">v{state.version} baixada</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Reinicie o launcher para aplicar a atualização.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => getElectron().installUpdate?.()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-hazze-pink text-white font-bold rounded-lg hover:brightness-110 transition text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Reiniciar e Instalar
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2.5 border border-white/10 text-gray-400 rounded-lg hover:text-white transition text-sm"
              >
                Depois
              </button>
            </div>
          </>
        )}

        {/* ── Erro ─────────────────────────────────────────────── */}
        {state.phase === 'error' && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Erro na atualização</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{state.message}</p>
              </div>
            </div>
            <button
              onClick={() => { setDismissed(false); getElectron().checkForUpdates?.() }}
              className="w-full py-2 border border-white/10 text-gray-400 rounded-lg text-sm hover:text-white transition"
            >
              Tentar novamente
            </button>
          </>
        )}
      </div>
    </div>
  )
}
