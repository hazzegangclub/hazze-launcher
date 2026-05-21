import { NEWS } from '../lib/api'

export default function PatchNotes() {
  const patches = NEWS.filter(n => n.category === 'patch' || n.category === 'update')

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-lg font-black text-white mb-1">Patch Notes</h2>
      <p className="text-xs text-gray-500 mb-6">Histórico de atualizações do Hazze Gang Club Strikers.</p>

      <div className="flex flex-col gap-6 max-w-2xl">
        {patches.map(item => {
          const lines = item.body.split('\n').map((line, i) => {
            if (line.startsWith('•')) return <li key={i} className="ml-4 list-disc">{line.slice(1).trim()}</li>
            if (line.startsWith('**') && line.endsWith('**'))
              return <p key={i} className="font-bold text-white mt-2">{line.replaceAll('**', '')}</p>
            if (!line) return <br key={i} />
            return <p key={i}>{line}</p>
          })

          return (
            <div key={item.id} className="border border-hazze-border rounded-xl p-5 bg-hazze-panel">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-hazze-pink">{item.id.toUpperCase()}</span>
                <span className="text-xs text-gray-600">
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h3 className="font-bold text-white mb-3">{item.title}</h3>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">{lines}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
