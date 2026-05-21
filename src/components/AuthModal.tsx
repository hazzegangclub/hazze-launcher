import { useState } from 'react'
import { X, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react'
import { authApi } from '../lib/api'

interface Props { onClose: () => void }
type Mode = 'register' | 'login'

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [playerId, setPlayerId] = useState('')
  const [copied, setCopied]     = useState(false)
  const [error, setError]       = useState('')

  const isRegister = mode === 'register'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (isRegister) {
      if (password !== confirm) { setError('As senhas não coincidem.'); return }
      if (nickname.length < 2)  { setError('Nickname precisa ter pelo menos 2 caracteres.'); return }
      if (!/^[a-zA-Z0-9_\-]+$/.test(nickname)) { setError('Nickname: apenas letras, números, _ e -.'); return }
    }
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }

    setLoading(true)
    try {
      const res = isRegister
        ? await authApi.register(email, password, nickname)
        : await authApi.login(email, password)

      localStorage.setItem('auth_bearer_token',  res.token)
      localStorage.setItem('auth_refresh_token', res.refreshToken)
      if (res.playerId)  localStorage.setItem('auth_player_id', res.playerId)
      if (res.nickname)  localStorage.setItem('auth_nickname',  res.nickname)
      if (res.playerId)  setPlayerId(res.playerId)
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido.'
      setError(msg === 'email_exists' ? 'Este email já está cadastrado.' : msg)
    } finally {
      setLoading(false)
    }
  }

  function copyId() {
    navigator.clipboard.writeText(playerId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Tela de sucesso ────────────────────────────────────────────────────
  if (success) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              {isRegister ? 'Conta criada!' : 'Login realizado!'}
            </h2>
            <p className="text-xs text-gray-500">
              {isRegister ? `Bem-vindo, ${nickname}!` : 'Bem-vindo de volta!'}
            </p>
          </div>

          {/* Player ID card */}
          {playerId && (
            <div className="w-full bg-hazze-dark border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5">Seu Player ID</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-hazze-cyan font-mono truncate">{playerId}</code>
                <button
                  onClick={copyId}
                  title="Copiar ID"
                  className="text-gray-500 hover:text-white transition shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-2">
                Guarde este ID — é como outros jogadores te identificam.
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-hazze-pink text-white font-bold rounded-lg hover:brightness-110 transition"
          >
            {isRegister ? 'Entrar no Launcher' : 'Jogar'}
          </button>
        </div>
      </Overlay>
    )
  }

  // ── Formulário ─────────────────────────────────────────────────────────
  return (
    <Overlay onClose={onClose}>
      {/* Tabs */}
      <div className="flex mb-5 border-b border-hazze-border">
        {(['login', 'register'] as Mode[]).map((m) => (
          <button key={m}
            onClick={() => { setMode(m); setError('') }}
            className={`px-5 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
              mode === m ? 'border-hazze-pink text-hazze-pink' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {m === 'register' ? 'Criar Conta' : 'Entrar'}
          </button>
        ))}
      </div>

      <h2 className="text-base font-bold text-white mb-0.5">
        {isRegister ? 'Crie sua conta gratuita' : 'Entre na sua conta'}
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        {isRegister ? 'Acesso a todos os modos, recompensas e eventos.' : 'Continue sua jornada no Hazze Gang Club.'}
      </p>

      {error && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* Nickname — só no register */}
        {isRegister && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Nickname <span className="text-gray-600">(como aparece no jogo)</span>
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={24}
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Ex: NightHawk_99"
              className="w-full px-3 py-2.5 bg-hazze-dark border border-hazze-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hazze-pink transition"
            />
            <p className="text-[10px] text-gray-600 mt-1">Letras, números, _ e - · 2–24 caracteres</p>
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-400 mb-1">Email</label>
          <input
            type="email" required value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="w-full px-3 py-2.5 bg-hazze-dark border border-hazze-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hazze-cyan transition"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Senha</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'} required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2.5 bg-hazze-dark border border-hazze-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hazze-cyan transition pr-10"
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isRegister && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Confirmar senha</label>
            <input
              type={showPwd ? 'text' : 'password'} required value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              className="w-full px-3 py-2.5 bg-hazze-dark border border-hazze-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hazze-cyan transition"
            />
          </div>
        )}

        <button type="submit" disabled={loading}
          className="mt-1 w-full py-3 bg-hazze-pink text-white font-bold rounded-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRegister ? 'Criar Conta' : 'Entrar'}
        </button>
      </form>

      <p className="mt-4 text-xs text-center text-gray-600">
        {isRegister ? 'Já tem conta? ' : 'Sem conta? '}
        <button onClick={() => { setMode(isRegister ? 'login' : 'register'); setError('') }}
          className="text-hazze-cyan hover:underline">
          {isRegister ? 'Entrar' : 'Criar agora'}
        </button>
      </p>
    </Overlay>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm bg-hazze-panel border border-hazze-border rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
