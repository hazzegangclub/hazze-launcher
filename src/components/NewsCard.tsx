import { NewsItem } from '../lib/api'

const CATEGORY_STYLE = {
  patch:  { label: 'Patch',        color: 'bg-hazze-pink/20  text-hazze-pink  border-hazze-pink/30'  },
  event:  { label: 'Evento',       color: 'bg-yellow-500/20  text-yellow-400  border-yellow-500/30'  },
  update: { label: 'Atualização',  color: 'bg-hazze-cyan/20  text-hazze-cyan  border-hazze-cyan/30'  },
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const { label, color } = CATEGORY_STYLE[item.category]

  const bodyHtml = item.body
    .split('\n')
    .map(line =>
      line.startsWith('•')
        ? `<li class="ml-3">${line.slice(1).trim()}</li>`
        : line.startsWith('**') && line.endsWith('**')
        ? `<p class="font-semibold text-white mt-2">${line.replaceAll('**', '')}</p>`
        : line
        ? `<p>${line}</p>`
        : '<br/>'
    )
    .join('')

  return (
    <div className="group bg-hazze-panel border border-hazze-border rounded-xl overflow-hidden hover:border-hazze-pink/40 transition-all duration-200">
      {item.imageUrl && (
        <div className="h-32 bg-hazze-dark overflow-hidden">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${color}`}>
            {label}
          </span>
          <span className="text-[11px] text-gray-600">
            {new Date(item.date).toLocaleDateString('pt-BR')}
          </span>
        </div>
        <h3 className="font-bold text-white text-sm leading-snug mb-2">{item.title}</h3>
        <div
          className="text-xs text-gray-400 leading-relaxed line-clamp-4 [&_li]:list-disc"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>
    </div>
  )
}
