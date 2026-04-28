import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/client'
import { I } from '@/components/icons'
import { AdminApplications } from './AdminApplications'
import { AdminServices } from './AdminServices'
import type { AnalyticsSummary } from '@/types'

const NAV = [
  { id: 'dash',     label: 'Дашборд',      icon: 'Grid',     to: '/admin' },
  { id: 'apps',     label: 'Заявки',       icon: 'Document', to: '/admin/applications' },
  { id: 'services', label: 'Услуги',       icon: 'Briefcase',to: '/admin/services' },
  { id: 'users',    label: 'Пользователи', icon: 'User',     to: null },
  { id: 'analytics',label: 'Аналитика',    icon: 'Hash',     to: null },
  { id: 'settings', label: 'Настройки',    icon: 'Sliders',  to: null },
]

const CHART_DAYS = [32, 41, 38, 52, 49, 65, 71, 58, 84, 79]
const CHART_LABELS = ['01','04','07','10','13','16','19','22','25','28']
const ORGS = [
  { short: 'Демеу',        color: '#1E3A8A', pct: 38 },
  { short: 'KazExport',    color: '#0EA5E9', pct: 24 },
  { short: 'АгроКапитал', color: '#10B981', pct: 14 },
  { short: 'Astana Cap.',  color: '#7C3AED', pct: 12 },
  { short: 'ИнноФонд',    color: '#F59E0B', pct:  8 },
  { short: 'KazGuarantee',color: '#DC2626', pct:  4 },
]

function Sidebar({ active }: { active: string }) {
  const navigate = useNavigate()
  return (
    <aside style={{
      width: 240, background: '#0F172A', color: '#CBD5E1',
      padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2,
      minHeight: 'calc(100vh - 64px)', position: 'sticky', top: 64,
    }}>
      <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Админ-панель</div>
      </div>
      {NAV.map((it) => {
        const Ic = I[it.icon as keyof typeof I]
        const isActive = active === it.id
        return (
          <button key={it.id} onClick={() => it.to && navigate(it.to)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', border: 'none', cursor: it.to ? 'pointer' : 'not-allowed',
            background: isActive ? 'rgba(59,130,246,0.18)' : 'transparent',
            color: isActive ? '#fff' : it.to ? '#94A3B8' : '#475569',
            borderRadius: 6, fontSize: 13, fontWeight: 500, transition: 'all 120ms',
            opacity: it.to ? 1 : 0.5,
          }}
            onMouseEnter={(e) => { if (!isActive && it.to) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#fff' } }}
            onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = it.to ? '#94A3B8' : '#475569' } }}
          >
            {Ic && <Ic size={16} />}
            <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>
          </button>
        )
      })}
    </aside>
  )
}

function DashboardContent() {
  const { data: summary } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.summary().then((r) => r.data),
  })

  const maxV = Math.max(...CHART_DAYS)
  const stats = [
    { label: 'Всего заявок',           value: summary?.total_applications ?? '—',  delta: '+8.2%', up: true },
    { label: 'На рассмотрении',        value: summary?.pending_applications ?? '—', delta: '+15',   up: true },
    { label: 'Одобрено за месяц',      value: summary?.total_services ?? '—',       delta: '+12.4%',up: true },
    { label: 'Активных пользователей', value: summary?.total_users ?? '—',          delta: '−2.1%', up: false },
  ]

  return (
    <div className="page-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Дашборд</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 6, marginBottom: 0 }}>Общая статистика по платформе</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="select" style={{ height: 36, width: 'auto' }}>
            <option>Последние 30 дней</option><option>За квартал</option><option>За год</option>
          </select>
          <button className="btn btn-secondary btn-sm"><I.Download size={14} />Экспорт</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: s.up ? 'var(--color-success)' : 'var(--color-danger)' }}>{s.delta}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>vs. прошлый месяц</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, marginBottom: 4 }}>Заявки за последние 30 дней</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', margin: 0, marginBottom: 16 }}>Динамика подачи заявок</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
            {CHART_DAYS.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                  <div style={{ width: '100%', height: `${(v / maxV) * 100}%`, background: 'linear-gradient(180deg, var(--color-accent) 0%, #1E3A8A 100%)', borderRadius: '4px 4px 0 0', minHeight: 6 }} title={`${v} заявок`} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>{CHART_LABELS[i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, marginBottom: 16 }}>По организациям</h3>
          {ORGS.map((o) => (
            <div key={o.short} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: 'var(--color-text-2)' }}>{o.short}</span>
                <span style={{ color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>{o.pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${o.pct}%`, height: '100%', background: o.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/admin/services/new" className="btn btn-primary"><I.Plus size={15} />Создать услугу</Link>
        <Link to="/admin/applications" className="btn btn-secondary">Все заявки</Link>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const location = useLocation()
  const isApps     = location.pathname.startsWith('/admin/applications')
  const isServices = location.pathname.startsWith('/admin/services')
  const active = isApps ? 'apps' : isServices ? 'services' : 'dash'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar active={active} />
      <main style={{ padding: '32px 40px', background: 'var(--color-bg)', overflow: 'hidden' }}>
        {active === 'apps'     && <AdminApplications />}
        {active === 'services' && <AdminServices />}
        {active === 'dash'     && <DashboardContent />}
      </main>
    </div>
  )
}
