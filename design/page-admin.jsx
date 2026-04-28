// ===== Admin Panel =====

const AdminSidebar = ({ active, onChange }) => {
  const items = [
    { id: 'dash',      label: 'Дашборд',      icon: 'Grid' },
    { id: 'apps',      label: 'Заявки',        icon: 'Document', count: 342 },
    { id: 'services',  label: 'Услуги',        icon: 'Briefcase' },
    { id: 'users',     label: 'Пользователи',  icon: 'User' },
    { id: 'content',   label: 'Контент',       icon: 'Tag' },
    { id: 'analytics', label: 'Аналитика',     icon: 'Hash' },
    { id: 'settings',  label: 'Настройки',     icon: 'Sliders' },
  ];
  return (
    <aside style={{
      width: 240, background: '#0F172A', color: '#CBD5E1',
      padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2,
      minHeight: 'calc(100vh - 64px)', position: 'sticky', top: 64,
    }}>
      <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Админ-панель</div>
      </div>
      {items.map(it => {
        const Ic = I[it.icon];
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', border: 'none', cursor: 'pointer',
            background: isActive ? 'rgba(59,130,246,0.18)' : 'transparent',
            color: isActive ? '#fff' : '#94A3B8',
            borderRadius: 6, fontSize: 13, fontWeight: 500,
            transition: 'all 120ms',
          }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
          >
            <Ic size={16} />
            <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>
            {it.count !== undefined && (
              <span style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(59,130,246,0.25)', color: '#93C5FD', borderRadius: 999, fontWeight: 600 }}>{it.count}</span>
            )}
          </button>
        );
      })}
    </aside>
  );
};

const AdminChart = () => {
  const max = Math.max(...MOCK2.ADMIN_CHART_DAYS.map(d => d.v));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, paddingTop: 10 }}>
      {MOCK2.ADMIN_CHART_DAYS.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            <div style={{
              width: '100%', height: `${(d.v / max) * 100}%`,
              background: 'linear-gradient(180deg, var(--color-accent) 0%, #1E3A8A 100%)',
              borderRadius: '4px 4px 0 0',
              minHeight: 6,
            }} title={`${d.v} заявок`} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>{d.d}</div>
        </div>
      ))}
    </div>
  );
};

const AdminPage = ({ go }) => {
  const [section, setSection] = React.useState('dash');
  const [appFilter, setAppFilter] = React.useState('all');
  const [selected, setSelected] = React.useState([]);
  const toast = useToast();

  const allApps = MOCK2.APPLICATIONS;
  const filtered = appFilter === 'all' ? allApps : allApps.filter(a => a.status === appFilter);

  return (
    <div className="page-fade" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 64px)' }}>
      <AdminSidebar active={section} onChange={setSection} />
      <main style={{ padding: '32px 40px', background: 'var(--color-bg)', overflow: 'hidden' }}>

        {section === 'dash' && (
          <div className="page-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Дашборд</h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 6, marginBottom: 0 }}>Общая статистика по платформе · обновлено только что</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="select" style={{ height: 36, width: 'auto' }}>
                  <option>Последние 30 дней</option>
                  <option>За квартал</option>
                  <option>За год</option>
                </select>
                <button className="btn btn-secondary btn-sm"><I.Download size={14} />Экспорт</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {MOCK2.ADMIN_STATS.map((s, i) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: s.trend === 'up' ? 'var(--color-success)' : 'var(--color-danger)',
                    }}>{s.delta}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>vs. прошлый месяц</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Заявки за последние 30 дней</h3>
                    <p style={{ fontSize: 13, color: 'var(--color-text-3)', margin: 0, marginTop: 4 }}>Динамика подачи заявок</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-text-3)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, background: 'var(--color-accent)', borderRadius: 2 }} />
                      Подано
                    </span>
                  </div>
                </div>
                <AdminChart />
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, marginBottom: 16 }}>По организациям</h3>
                {MOCK.ORGS.map((o, i) => {
                  const pct = [38, 24, 14, 12, 8, 4][i];
                  return (
                    <div key={o.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: 'var(--color-text-2)' }}>{o.short}</span>
                        <span style={{ color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--color-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: o.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Последние заявки</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSection('apps')}>Все заявки <I.ArrowRight size={13} /></button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)' }}>
                    {['Номер', 'Услуга', 'Сумма', 'Дата', 'Статус'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK2.APPLICATIONS.slice(0, 4).map((a, i) => {
                    const s = MOCK.SERVICES.find(x => x.id === a.service);
                    const meta = MOCK2.STATUS_META[a.status];
                    return (
                      <tr key={a.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{a.id}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{s?.title}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{a.sum}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-3)' }}>{a.date}</td>
                        <td style={{ padding: '12px 16px' }}><span className={`badge ${meta.cls} badge-dot`}>{meta.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'apps' && (
          <div className="page-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Заявки <span style={{ fontSize: 14, color: 'var(--color-text-3)', fontWeight: 500 }}>· {filtered.length}</span></h1>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm"><I.Filter size={14} />Фильтры</button>
                <button className="btn btn-secondary btn-sm"><I.Download size={14} />Экспорт</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-2)', padding: 3, borderRadius: 8, marginBottom: 16, alignSelf: 'flex-start', width: 'fit-content' }}>
              {[
                { id: 'all', label: 'Все' }, { id: 'review', label: 'На рассмотрении' },
                { id: 'docs', label: 'Документы' }, { id: 'approved', label: 'Одобрено' }, { id: 'rejected', label: 'Отклонено' },
              ].map(t => (
                <button key={t.id} onClick={() => setAppFilter(t.id)} style={{
                  padding: '6px 12px', height: 32, border: 'none', borderRadius: 6,
                  background: appFilter === t.id ? '#fff' : 'transparent',
                  color: appFilter === t.id ? 'var(--color-text)' : 'var(--color-text-3)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  boxShadow: appFilter === t.id ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                }}>{t.label}</button>
              ))}
            </div>

            {selected.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--color-accent-soft)', borderRadius: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>Выбрано: {selected.length}</span>
                <div style={{ flex: 1 }} />
                <button className="btn btn-secondary btn-sm" onClick={() => { toast.push('Статус обновлён', 'success'); setSelected([]); }}>Изменить статус</button>
                <button className="btn btn-secondary btn-sm">Назначить</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Снять выделение</button>
              </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)' }}>
                    <th style={{ padding: '10px 16px', width: 40 }}>
                      <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                        onChange={(e) => setSelected(e.target.checked ? filtered.map(a => a.id) : [])}
                        style={{ accentColor: 'var(--color-accent)' }} />
                    </th>
                    {['Номер', 'Услуга', 'Сумма', 'Дата', 'Статус', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const s = MOCK.SERVICES.find(x => x.id === a.service);
                    const meta = MOCK2.STATUS_META[a.status];
                    const checked = selected.includes(a.id);
                    return (
                      <tr key={a.id} style={{ borderTop: '1px solid var(--color-border)', background: checked ? 'var(--color-accent-soft)' : 'transparent' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <input type="checkbox" checked={checked} onChange={() => setSelected(arr => checked ? arr.filter(x => x !== a.id) : [...arr, a.id])}
                            style={{ accentColor: 'var(--color-accent)' }} />
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{a.id}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>
                          <div style={{ fontWeight: 500 }}>{s?.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>{MOCK.orgById(s?.org)?.short}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{a.sum}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-text-3)' }}>{a.date}</td>
                        <td style={{ padding: '12px 16px' }}><span className={`badge ${meta.cls} badge-dot`}>{meta.label}</span></td>
                        <td style={{ padding: '12px 16px' }}>
                          <button className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }}><I.ChevronRight size={15} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'services' && (
          <div className="page-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Управление услугами</h1>
              <button className="btn btn-primary" onClick={() => go('formbuilder')}><I.Plus size={15} />Добавить услугу</button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)' }}>
                    {['Услуга', 'Организация', 'Направление', 'Заявок', 'Статус', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK.SERVICES.map((s, i) => (
                    <tr key={s.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, maxWidth: 320 }}>{s.title}</td>
                      <td style={{ padding: '14px 16px' }}><OrgBadge orgId={s.org} /></td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-2)' }}>{MOCK.DIRECTIONS.find(d => d.id === s.dir)?.title}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{Math.floor(Math.random() * 200) + 20}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <span style={{
                            width: 32, height: 18, borderRadius: 999,
                            background: 'var(--color-success)', position: 'relative',
                          }}>
                            <span style={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, background: '#fff', borderRadius: '50%' }} />
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--color-text-2)' }}>Активна</span>
                        </label>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => go('formbuilder', { id: s.id })}>Редактировать</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(section === 'users' || section === 'content' || section === 'analytics' || section === 'settings') && (
          <div className="page-fade card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--color-text-3)' }}>
              <I.Sparkle size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 6 }}>Раздел в разработке</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: 0 }}>Этот раздел админ-панели появится в следующей итерации</p>
          </div>
        )}
      </main>
    </div>
  );
};

window.AdminPage = AdminPage;
