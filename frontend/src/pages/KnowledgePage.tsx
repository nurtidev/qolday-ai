import { I } from '@/components/icons'

const CATEGORIES = [
  { id: 'start', title: 'С чего начать',    count: 8,  icon: 'Sparkle' },
  { id: 'apply', title: 'Подача заявки',    count: 12, icon: 'Document' },
  { id: 'docs',  title: 'Документы',        count: 9,  icon: 'Briefcase' },
  { id: 'edit',  title: 'ЭЦП и eGov',      count: 6,  icon: 'Shield' },
  { id: 'fin',   title: 'Финансирование',   count: 14, icon: 'Coins' },
  { id: 'faq',   title: 'Часто задаваемые', count: 23, icon: 'Info' },
]

const ARTICLES = [
  { title: 'Как зарегистрироваться на портале Qoldau AI',              read: '3 мин', date: '20 апр. 2026' },
  { title: 'Пошаговая инструкция по подаче заявки на финансирование',  read: '7 мин', date: '18 апр. 2026' },
  { title: 'Установка и настройка NCALayer для подписания ЭЦП',        read: '5 мин', date: '14 апр. 2026' },
  { title: 'Какие документы нужны для подачи заявки на кредит',        read: '4 мин', date: '12 апр. 2026' },
  { title: 'Различия между льготным и коммерческим финансированием',    read: '6 мин', date: '08 апр. 2026' },
  { title: 'Что делать, если заявка отклонена',                        read: '4 мин', date: '02 апр. 2026' },
]

export function KnowledgePage() {
  return (
    <div className="page-fade container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Помощь</div>
        <h1 className="section-title" style={{ fontSize: 32 }}>База знаний</h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-3)', marginTop: 8 }}>Инструкции, FAQ и руководства по работе с порталом</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 48 }}>
        {CATEGORIES.map((cat) => {
          const Icon = I[cat.icon as keyof typeof I]
          return (
            <div key={cat.id} className="card" style={{ padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 140ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-accent-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                {Icon && <Icon size={20} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{cat.title}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>{cat.count} статей</div>
              </div>
            </div>
          )
        })}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Популярные статьи</h2>
      <div className="card" style={{ padding: 0 }}>
        {ARTICLES.map((a, i) => (
          <div key={i} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderTop: i > 0 ? '1px solid var(--color-border)' : 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 4 }}>{a.date} · {a.read} чтения</div>
            </div>
            <I.ChevronRight size={16} style={{ color: 'var(--color-text-4)', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
