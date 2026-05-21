import { Download, Newspaper, User, Settings, Shield } from 'lucide-react'

interface Props {
  activePage: string
  onNavigate: (page: string) => void
  onAuthClick: () => void
  isLoggedIn: boolean
}

const NAV = [
  { id: 'home',    icon: Newspaper, label: 'Novidades'  },
  { id: 'account', icon: User,      label: 'Conta'       },
  { id: 'patch',   icon: Shield,    label: 'Patch Notes' },
  { id: 'settings',icon: Settings,  label: 'Config'      },
]

export default function Sidebar({ activePage, onNavigate, onAuthClick, isLoggedIn }: Props) {
  return (
    <aside className="w-16 flex flex-col items-center py-4 gap-1 bg-hazze-dark border-r border-hazze-border">
      {/* Logo mark */}
      <div className="w-9 h-9 mb-4 rounded-lg bg-hazze-pink flex items-center justify-center font-black text-white text-lg select-none">
        H
      </div>

      {NAV.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => onNavigate(id)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            activePage === id
              ? 'bg-hazze-pink/20 text-hazze-pink'
              : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Auth / Download */}
      {!isLoggedIn && (
        <button
          title="Criar conta / Entrar"
          onClick={onAuthClick}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-hazze-cyan hover:bg-hazze-cyan/10 transition"
        >
          <User className="w-5 h-5" />
        </button>
      )}
      <button
        title="Baixar / Atualizar jogo"
        onClick={() => onNavigate('home')}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-hazze-pink hover:bg-hazze-pink/10 transition"
      >
        <Download className="w-5 h-5" />
      </button>
    </aside>
  )
}
