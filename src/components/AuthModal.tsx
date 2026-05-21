import { useState } from 'react'
import { X, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { authApi } from '../lib/api'

interface Props {
  onClose: () => void
}

type Mode = 'register' | 'login'

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode]           = useState<Mode>('register')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')

  const isRegister = mode === 'register'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (isRegister && password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = isRegister
        ? await authApi.register(email, password)
        : await authApi.login(email, password)

      localStorage.setItem('auth_bearer_token', res.token)
      localStorage.setItem('auth_refresh_token', res.refreshToken)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle2 className="w-14 h-14 text-green-400" />
          <h2 className="text-xl font-bold text-white">
            {isRegister ? 'Conta criada!' : 'Login realizado!'}
          </h2>
          <p className="text-sm text-gray-400 max-w-xs">
            {isRegister
              ? 'Bem-vindo ao Hazze Gang Club Strikers. Baixe o launcher e entre em ação!'
              : 'Você está logado. Clique em Jogar para iniciar o launcher.'}
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-8 py-2.5 bg-hazze-pink text-white font-semibold rounded-lg hover:brightness-110 transition"
          >
            {isRegister ? 'Baixar Launcher' : 'Jogar'}
          </button>
        </div>
      </Overlay>
    )
  }

  return (
    <Overlay onClose={onClose}>
      {/* Tabs */}
      <div className="flex mb-6 border-b border-hazze-border">
        {(['register', 'login'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            className={`px-5 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
              mode === m
                ? 'border-hazze-pink text-hazze-pink'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {m === 'register' ? 'Criar Conta' : 'Entrar'}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold text-white mb-1">
        {isRegister ? 'Crie sua conta gratuita' : 'Entre na sua conta'}
      </h2>
      <p className="text-xs text-gray-500 mb-5">
        {isRegister
          ? 'Acesso a todos os modos de jogo, recompensas e eventos.'
          : 'Continue sua jornada no Hazze Gang Club.'}
      </p>

      {error && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="w-full px-3 py-2.5 bg-hazze-dark border border-hazze-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hazze-cyan transition"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Senha</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2.5 bg-hazze-dark border border-hazze-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hazze-cyan transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isRegister && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Confirmar senha</label>
            <input
              type={showPwd ? 'text' : 'password'}
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              className="w-full px-3 py-2.5 bg-hazze-dark border border-hazze-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-hazze-cyan transition"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 bg-hazze-pink text-white font-bold rounded-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRegister ? 'Criar Conta' : 'Entrar'}
        </button>
      </form>

      <p className="mt-4 text-xs text-center text-gray-600">
        {isRegister ? 'Já tem conta? ' : 'Sem conta? '}
        <button
          onClick={() => { setMode(isRegister ? 'login' : 'register'); setError('') }}
          className="text-hazze-cyan hover:underline"
        >
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
