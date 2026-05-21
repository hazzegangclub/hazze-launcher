import { User, LogOut, Download } from 'lucide-react'

interface Props {
  isLoggedIn: boolean
  onAuthClick: () => void
  onLogout: () => void
}

const DOWNLOAD_URL = '#'

export default function Account({ isLoggedIn, onAuthClick, onLogout }: Props) {
  const email = localStorage.getItem('auth_email') ?? ''

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-hazze-panel border border-hazze-border flex items-center justify-center">
          <User className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-lg font-bold text-white">Faça login ou crie sua conta</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Acompanhe seu progresso, participe de eventos e acesse todas as funcionalidades do jogo.
        </p>
        <button
          onClick={onAuthClick}
          className="px-8 py-2.5 bg-hazze-pink text-white font-bold rounded-lg hover:brightness-110 transition"
        >
          Entrar / Criar Conta
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-black text-white mb-6">Sua Conta</h2>

      <div className="max-w-md flex flex-col gap-4">
        <div className="bg-hazze-panel border border-hazze-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-hazze-pink/20 border border-hazze-pink/30 flex items-center justify-center">
            <User className="w-6 h-6 text-hazze-pink" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Conta</p>
            <p className="font-semibold text-white">{email || 'Jogador'}</p>
            <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online
            </p>
          </div>
        </div>

        <a
          href={DOWNLOAD_URL}
          className="flex items-center gap-3 px-5 py-3 bg-hazze-pink text-white font-bold rounded-xl hover:brightness-110 transition"
        >
          <Download className="w-5 h-5" />
          Baixar / Atualizar Launcher
        </a>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-3 border border-hazze-border text-gray-400 font-semibold rounded-xl hover:text-white hover:border-gray-500 transition text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
