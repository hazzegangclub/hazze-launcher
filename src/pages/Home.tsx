import { useState } from 'react'
import { Download, Play, ChevronRight, Zap } from 'lucide-react'
import NewsCard from '../components/NewsCard'
import { NEWS, type NewsItem } from '../lib/api'

interface Props {
  isLoggedIn: boolean
  onAuthClick: () => void
}

// URL de download do launcher — alterar quando houver build
const DOWNLOAD_URL = '#'
const GAME_VERSION = 'v1.0.0'

export default function Home({ isLoggedIn, onAuthClick }: Props) {
  const [activeNews, setActiveNews] = useState(NEWS[0])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Hero */}
      <div className="relative flex-shrink-0 h-72 bg-hazze-dark overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-hazze-dark via-hazze-dark/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-hazze-dark via-transparent to-transparent z-10" />

        {/* Placeholder bg — substitua por um screenshot do jogo */}
        <div className="absolute inset-0 bg-gradient-to-br from-hazze-dark via-[#1a0a2e] to-[#0d1a2e] opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-[12rem] font-black text-white select-none pointer-events-none">
          HGC
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-end h-full p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-hazze-pink text-white rounded uppercase tracking-widest">
              {GAME_VERSION}
            </span>
            <span className="text-xs text-gray-400">Lançamento oficial</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-none mb-1">
            HAZZE GANG CLUB
          </h1>
          <p className="text-hazze-pink font-bold text-sm tracking-widest mb-4">
            STRIKERS
          </p>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <a
                href={DOWNLOAD_URL}
                className="flex items-center gap-2 px-6 py-2.5 bg-hazze-pink text-white font-bold rounded-lg hover:brightness-110 transition text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                Jogar
              </a>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-2 px-6 py-2.5 bg-hazze-pink text-white font-bold rounded-lg hover:brightness-110 transition text-sm"
              >
                <Zap className="w-4 h-4" />
                Criar Conta Grátis
              </button>
            )}
            <a
              href={DOWNLOAD_URL}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/5 transition text-sm"
            >
              <Download className="w-4 h-4" />
              Baixar Launcher
            </a>
          </div>
        </div>
      </div>

      {/* News section */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* News list */}
        <div className="w-72 flex-shrink-0 flex flex-col border-r border-hazze-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hazze-border">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Novidades</span>
            <button className="text-xs text-hazze-cyan hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2">
            {NEWS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveNews(item)}
                className={`text-left rounded-xl overflow-hidden transition-all border ${
                  activeNews?.id === item.id
                    ? 'border-hazze-pink/60 bg-hazze-pink/5'
                    : 'border-transparent hover:border-hazze-border'
                }`}
              >
                <NewsCard item={item} />
              </button>
            ))}
          </div>
        </div>

        {/* Selected news detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeNews ? (
            <NewsDetail item={activeNews} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-700 text-sm">
              Selecione uma novidade
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NewsDetail({ item }: { item: NewsItem }) {
  const { label, color } = {
    patch:  { label: 'Patch',        color: 'bg-hazze-pink/20  text-hazze-pink  border-hazze-pink/30'  },
    event:  { label: 'Evento',       color: 'bg-yellow-500/20  text-yellow-400  border-yellow-500/30'  },
    update: { label: 'Atualização',  color: 'bg-hazze-cyan/20  text-hazze-cyan  border-hazze-cyan/30'  },
  }[item.category]

  const lines = item.body.split('\n').map((line, i) => {
    if (line.startsWith('•')) return <li key={i} className="ml-4 list-disc">{line.slice(1).trim()}</li>
    if (line.startsWith('**') && line.endsWith('**'))
      return <p key={i} className="font-bold text-white mt-3">{line.replaceAll('**', '')}</p>
    if (!line) return <br key={i} />
    return <p key={i}>{line}</p>
  })

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${color}`}>
          {label}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      </div>
      <h2 className="text-xl font-black text-white mb-4">{item.title}</h2>
      <div className="text-sm text-gray-400 leading-relaxed space-y-1">
        {lines}
      </div>
    </div>
  )
}
