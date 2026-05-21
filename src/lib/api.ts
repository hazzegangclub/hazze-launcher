// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8080'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? data.message ?? `HTTP ${res.status}`)
  return data as T
}

export interface AuthResponse {
  token: string
  refreshToken: string
  emailVerified: boolean
  verificationToken?: string
}

export const authApi = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
}

export interface NewsItem {
  id: string
  title: string
  body: string
  category: 'patch' | 'event' | 'update'
  date: string
  imageUrl?: string
}

// Patch notes e novidades — pode ser substituído por endpoint real no futuro
export const NEWS: NewsItem[] = [
  {
    id: 'v1.0.0',
    title: 'Hazze Gang Club Strikers — Versão 1.0.0',
    category: 'patch',
    date: '2026-05-20',
    body: `🎮 **Lançamento Oficial!**\n\nBem-vindo ao Hazze Gang Club Strikers. Forme sua gangue, escolha sua facção e entre na batalha.\n\n**Novidades:**\n• 8 personagens jogáveis na launch\n• 3 modos de jogo: Casual, Ranked e Facção\n• Sistema de crafting e economia in-game\n• Matchmaking com MMR\n• PvE cooperativo (em breve)`,
    imageUrl: '',
  },
  {
    id: 'event-01',
    title: 'Evento de Abertura — Recompensas Exclusivas',
    category: 'event',
    date: '2026-05-20',
    body: `🏆 **Evento de lançamento ativo até 30/05!**\n\nJogue qualquer partida para ganhar o badge exclusivo "Fundador" e 500 Hazze Points.\n\nOs top 10 jogadores da temporada inaugural ganharão personagem exclusivo.`,
    imageUrl: '',
  },
  {
    id: 'update-nitss',
    title: 'Nitss recebeu rebalanceamento',
    category: 'update',
    date: '2026-05-18',
    body: `⚔️ **Mudanças no Nitss:**\n\n• Dano base do combo solo +8%\n• Cooldown da habilidade especial reduzido de 12s → 10s\n• Animação de dash corrigida`,
    imageUrl: '',
  },
]
