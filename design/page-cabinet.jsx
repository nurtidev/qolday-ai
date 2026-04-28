// ===== User Cabinet =====

const CabinetSidebar = ({ active, onChange, unread }) => {
  const items = [
    { id: 'apps',     label: 'Мои заявки',    icon: 'Document', count: 6 },
    { id: 'notifs',   label: 'Уведомления',   icon: 'Bell',     count: unread },
    { id: 'profile',  label: 'Профиль',       icon: 'User' },
    { id: 'docs',     label: 'Документы',     icon: 'Briefcase' },
  ];
  return (
    <aside className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--color-border)', marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--color-primary)', color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 15,
        }}>АН</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Аскаров Н.Б.</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>ТОО «Сары-Арка Агро»</div>
        </div>
      </div>
      {items.map(it => {
        const Ic = I[it.icon];
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', border: 'none', cursor: 'pointer',
            background: isActive ? 'var(--color-accent-soft)' : 'transparent',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-2)',
            borderRadius: 6, fontSize: 14, fontWeight: 500, marginBottom: 2,
            transition: 'background 120ms',
          }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--color-surface-2)'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            <Ic size={17} />
            <span style={{ flex: 1, textAlign: 'left' }}>{it.label}</span>
            {it.count !== undefined && it.count > 0 && (
              <span style={{
                minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999,
                background: isActive ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: isActive ? '#fff' : 'var(--color-text-3)',
                fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{it.count}</span>
            )}
          </button>
        );
      })}
    </aside>
  );
};

const ApplicationRow = ({ a, onOpen }) => {
  const s = MOCK.SERVICES.find(x => x.id === a.service);
  const meta = MOCK2.STATUS_META[a.status];
  return (
    <tr style={{ borderTop: '1px solid var(--color-border)', cursor: 'pointer' }}
      onClick={() => onOpen(a)}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--color-text-2)' }}>{a.id}</td>
      <td style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 2 }}>{s?.title}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{MOCK.orgById(s?.org)?.short}</div>
      </td>
      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-2)', fontVariantNumeric: 'tabular-nums' }}>{a.sum}</td>
      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-3)' }}>{a.date}</td>
      <td style={{ padding: '14px 16px' }}>
        <span className={`badge ${meta.cls} badge-dot`}>{meta.label}</span>
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <I.ChevronRight size={16} style={{ color: 'var(--color-text-3)' }} />
      </td>
    </tr>
  );
};

const ApplicationDetailModal = ({ a, onClose }) => {
  const s = MOCK.SERVICES.find(x => x.id === a.service);
  const meta = MOCK2.STATUS_META[a.status];
  const timeline = [
    { n: 1, title: 'Заявка подана',          state: 'done', date: a.date },
    { n: 2, title: 'Документы проверены',    state: a.step >= 2 ? 'done' : 'pending', date: a.step >= 2 ? '25 апр. 2026' : '' },
    { n: 3, title: 'Рассмотрение комитетом', state: a.step >= 3 ? 'done' : a.step === 2 ? 'active' : 'pending', date: a.step >= 3 ? '27 апр. 2026' : '' },
    { n: 4, title: a.status === 'rejected' ? 'Отказано' : 'Решение принято', state: a.step >= 4 ? (a.status === 'rejected' ? 'rejected' : 'done') : 'pending', date: a.step >= 4 ? '28 апр. 2026' : '' },
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4 }}>{a.id}</div>
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{s?.title}</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }}><I.X size={16} /></button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <span className={`badge ${meta.cls} badge-dot`}>{meta.label}</span>
            <span className="badge badge-gray">Подана {a.date}</span>
            <span className="badge badge-gray">{a.sum}</span>
          </div>
          <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', margin: 0, marginBottom: 16, fontWeight: 600 }}>Статус обработки</h4>
          <div style={{ position: 'relative', paddingLeft: 4 }}>
            <div style={{ position: 'absolute', left: 14, top: 14, bottom: 14, width: 2, background: 'var(--color-border)' }} />
            {timeline.map((t, i) => {
              const color = t.state === 'done' ? 'var(--color-success)' :
                            t.state === 'active' ? 'var(--color-accent)' :
                            t.state === 'rejected' ? 'var(--color-danger)' : 'var(--color-border-strong)';
              return (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: t.state === 'pending' ? '#fff' : color,
                    color: t.state === 'pending' ? 'var(--color-text-3)' : '#fff',
                    border: t.state === 'pending' ? '2px solid var(--color-border-strong)' : 'none',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, flexShrink: 0, zIndex: 1,
                  }}>
                    {t.state === 'done' ? <I.Check size={13} strokeWidth={3} /> :
                     t.state === 'rejected' ? <I.X size={13} strokeWidth={3} /> :
                     t.state === 'active' ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} /> :
                     t.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t.title}</div>
                    {t.date && <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>{t.date}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {a.status === 'docs' && (
            <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--color-warning-soft)', border: '1px solid #FCD34D', borderRadius: 10, display: 'flex', gap: 12 }}>
              <I.Alert size={20} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.55 }}>
                Требуются дополнительные документы: финансовая отчётность за 2025 г.
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-secondary" onClick={onClose}>Закрыть</button>
          {a.status === 'docs' && <button className="btn btn-primary"><I.Upload size={15} />Догрузить документы</button>}
        </div>
      </div>
    </div>
  );
};

const CabinetPage = ({ go }) => {
  const [section, setSection] = React.useState('apps');
  const [filter, setFilter]   = React.useState('all');
  const [openApp, setOpenApp] = React.useState(null);
  const unread = MOCK2.NOTIFICATIONS.filter(n => !n.read).length;

  const filtered = MOCK2.APPLICATIONS.filter(a => filter === 'all' ? true : a.status === filter);

  return (
    <div className="page-fade container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <nav style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 12 }}>
        <a onClick={() => go('home')} style={{ cursor: 'pointer' }}>Главная</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--color-text-2)' }}>Личный кабинет</span>
      </nav>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, marginBottom: 24 }}>Личный кабинет</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28 }}>
        <CabinetSidebar active={section} onChange={setSection} unread={unread} />

        <main>
          {section === 'apps' && (
            <div className="page-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-2)', padding: 3, borderRadius: 8 }}>
                  {[
                    { id: 'all',      label: 'Все', n: MOCK2.APPLICATIONS.length },
                    { id: 'review',   label: 'На рассмотрении', n: MOCK2.APPLICATIONS.filter(a => a.status === 'review').length },
                    { id: 'docs',     label: 'Документы', n: MOCK2.APPLICATIONS.filter(a => a.status === 'docs').length },
                    { id: 'approved', label: 'Одобрено', n: MOCK2.APPLICATIONS.filter(a => a.status === 'approved').length },
                    { id: 'rejected', label: 'Отклонено', n: MOCK2.APPLICATIONS.filter(a => a.status === 'rejected').length },
                  ].map(t => (
                    <button key={t.id} onClick={() => setFilter(t.id)} style={{
                      padding: '6px 12px', height: 32, border: 'none', borderRadius: 6,
                      background: filter === t.id ? '#fff' : 'transparent',
                      color: filter === t.id ? 'var(--color-text)' : 'var(--color-text-3)',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      boxShadow: filter === t.id ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                      {t.label}
                      <span style={{ fontSize: 11, color: filter === t.id ? 'var(--color-text-3)' : 'var(--color-text-4)' }}>{t.n}</span>
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={() => go('services')}>
                  <I.Plus size={15} /> Подать новую заявку
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--color-text-3)' }}>
                    <I.Document size={24} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 6 }}>Заявок не найдено</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-3)', margin: 0 }}>В этой категории пока нет заявок</p>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-surface-2)' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Номер</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Услуга</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Сумма</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Дата</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Статус</th>
                        <th style={{ padding: '10px 16px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => <ApplicationRow key={a.id} a={a} onOpen={setOpenApp} />)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {section === 'notifs' && (
            <div className="page-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Уведомления</h2>
                <button className="btn btn-ghost btn-sm">Прочитать все</button>
              </div>
              <div className="card" style={{ padding: 0 }}>
                {MOCK2.NOTIFICATIONS.map((n, i) => {
                  const colors = { success: 'var(--color-success)', warn: 'var(--color-warning)', info: 'var(--color-accent)' };
                  const Ic = n.kind === 'success' ? I.CheckCircle : n.kind === 'warn' ? I.Alert : I.Info;
                  return (
                    <div key={n.id} style={{
                      padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start',
                      borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                      background: n.read ? 'transparent' : 'rgba(59,130,246,0.04)',
                    }}>
                      <Ic size={20} style={{ color: colors[n.kind], flexShrink: 0, marginTop: 1 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 500, color: 'var(--color-text)' }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 4 }}>{n.time}</div>
                      </div>
                      {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', marginTop: 8, flexShrink: 0 }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {section === 'profile' && (
            <div className="page-fade">
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 20 }}>Профиль</h2>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', margin: 0, marginBottom: 16, fontWeight: 600 }}>Личные данные</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 14, columnGap: 24, fontSize: 14, marginBottom: 28 }}>
                  <span style={{ color: 'var(--color-text-3)' }}>ФИО</span><span>Аскаров Нурлан Болатович</span>
                  <span style={{ color: 'var(--color-text-3)' }}>ИИН</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>870615301425</span>
                  <span style={{ color: 'var(--color-text-3)' }}>Телефон</span><span>+7 (701) 234 56 78</span>
                  <span style={{ color: 'var(--color-text-3)' }}>Email</span><span>n.askarov@mail.kz</span>
                </div>
                <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', margin: 0, marginBottom: 16, fontWeight: 600 }}>Компания</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 14, columnGap: 24, fontSize: 14, marginBottom: 24 }}>
                  <span style={{ color: 'var(--color-text-3)' }}>Наименование</span><span>ТОО «Сары-Арка Агро»</span>
                  <span style={{ color: 'var(--color-text-3)' }}>БИН</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>180840012345</span>
                  <span style={{ color: 'var(--color-text-3)' }}>Регион</span><span>Акмолинская область</span>
                  <span style={{ color: 'var(--color-text-3)' }}>Сотрудников</span><span>24</span>
                </div>
                <button className="btn btn-secondary"><I.Document size={15} />Редактировать профиль</button>
              </div>
            </div>
          )}

          {section === 'docs' && (
            <div className="page-fade">
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 20 }}>Мои документы</h2>
              <div className="card" style={{ padding: 0 }}>
                {[
                  { type: 'PDF', name: 'Учредительные документы ТОО «Сары-Арка Агро».pdf', date: '15 янв. 2026', size: '2.1 МБ' },
                  { type: 'XLSX', name: 'Финансовая отчётность 2024.xlsx', date: '02 фев. 2026', size: '1.4 МБ' },
                  { type: 'PDF', name: 'Справка об отсутствии задолженностей.pdf', date: '20 апр. 2026', size: '420 КБ' },
                  { type: 'DOCX', name: 'Бизнес-план 2026.docx', date: '24 апр. 2026', size: '3.2 МБ' },
                ].map((d, i, arr) => (
                  <div key={i} style={{
                    padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <div style={{
                      width: 38, height: 46, borderRadius: 5,
                      background: d.type === 'PDF' ? '#FEE2E2' : d.type === 'XLSX' ? '#D1FAE5' : '#DBEAFE',
                      color:      d.type === 'PDF' ? '#B91C1C' : d.type === 'XLSX' ? '#047857' : '#1E40AF',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>{d.type}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>{d.date} · {d.size}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm"><I.Download size={15} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-text-3)' }}><I.Trash size={15} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {openApp && <ApplicationDetailModal a={openApp} onClose={() => setOpenApp(null)} />}
    </div>
  );
};

window.CabinetPage = CabinetPage;
