// ===== Services Catalog =====

const FilterGroup = ({ title, options, selected, onToggle, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', padding: '16px 0' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
      }}>
        {title}
        <I.ChevronDown size={16} style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms', color: 'var(--color-text-3)' }} />
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          {options.map(o => {
            const active = selected.includes(o.id);
            return (
              <label key={o.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '6px 8px', borderRadius: 6,
                background: active ? 'var(--color-accent-soft)' : 'transparent',
                transition: 'background 120ms',
              }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--color-surface-2)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
                  background: active ? 'var(--color-accent)' : '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {active && <I.Check size={11} style={{ color: '#fff' }} strokeWidth={3} />}
                </span>
                <input type="checkbox" checked={active} onChange={() => onToggle(o.id)} style={{ display: 'none' }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-2)', flex: 1 }}>{o.label}</span>
                {o.count !== undefined && <span style={{ fontSize: 12, color: 'var(--color-text-4)' }}>{o.count}</span>}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ s, go }) => (
  <a className="card"
    onClick={() => go('service', { id: s.id })}
    style={{
      padding: 22, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'border-color 140ms, box-shadow 140ms',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = 'var(--sh-md)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'var(--sh-xs)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <OrgBadge orgId={s.org} />
      <button onClick={(e) => { e.stopPropagation(); e.currentTarget.style.color = 'var(--color-accent)'; }} style={{
        background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--color-text-4)', borderRadius: 4,
      }}><I.Bookmark size={18} /></button>
    </div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, marginBottom: 6 }}>{s.title}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.short}</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 12 }}>
      <div>
        <div style={{ color: 'var(--color-text-3)', marginBottom: 2 }}>Сумма</div>
        <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>{s.sumMax}</div>
      </div>
      <div>
        <div style={{ color: 'var(--color-text-3)', marginBottom: 2 }}>Ставка</div>
        <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>{s.rate}</div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {s.tags.map((t, i) => <span key={i} className="badge badge-gray">{t}</span>)}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 14, marginTop: 'auto' }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Обновлено {s.updated}</span>
      <span className="btn btn-accent btn-sm">Подать заявку <I.ArrowRight size={14} /></span>
    </div>
  </a>
);

const ServicesPage = ({ go, initialDir }) => {
  const [orgFilter, setOrgFilter]   = React.useState([]);
  const [dirFilter, setDirFilter]   = React.useState(initialDir ? [initialDir] : []);
  const [stageFilter, setStageFilter] = React.useState([]);
  const [regionFilter, setRegionFilter] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [view, setView]   = React.useState('grid');
  const [sort, setSort]   = React.useState('popular');

  const orgOptions = MOCK.ORGS.map(o => ({
    id: o.id, label: o.short,
    count: MOCK.SERVICES.filter(s => s.org === o.id).length
  }));
  const dirOptions = MOCK.DIRECTIONS.map(d => ({ id: d.id, label: d.title, count: d.count }));
  const stageOptions = [
    { id: 'idea',     label: 'Идея / стартап' },
    { id: 'early',    label: 'Начинающий бизнес' },
    { id: 'active',   label: 'Действующий бизнес' },
    { id: 'mature',   label: 'Зрелый бизнес' },
  ];
  const regionOptions = [
    { id: 'all',     label: 'Все регионы' },
    { id: 'astana',  label: 'г. Астана' },
    { id: 'almaty',  label: 'г. Алматы' },
    { id: 'shymk',   label: 'г. Шымкент' },
    { id: 'akmola',  label: 'Акмолинская область' },
    { id: 'almreg',  label: 'Алматинская область' },
  ];

  const toggle = (setter) => (id) =>
    setter(arr => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  const filtered = MOCK.SERVICES.filter(s => {
    if (orgFilter.length && !orgFilter.includes(s.org)) return false;
    if (dirFilter.length && !dirFilter.includes(s.dir)) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.short.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'popular') return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    if (sort === 'new') return b.updated.localeCompare(a.updated);
    return 0;
  });

  const activeChips = [
    ...orgFilter.map(id => ({ kind: 'org', id, label: MOCK.orgById(id)?.short })),
    ...dirFilter.map(id => ({ kind: 'dir', id, label: MOCK.DIRECTIONS.find(d => d.id === id)?.title })),
    ...stageFilter.map(id => ({ kind: 'stage', id, label: stageOptions.find(o => o.id === id)?.label })),
    ...regionFilter.map(id => ({ kind: 'region', id, label: regionOptions.find(o => o.id === id)?.label })),
  ];
  const removeChip = (c) => {
    if (c.kind === 'org') setOrgFilter(arr => arr.filter(x => x !== c.id));
    if (c.kind === 'dir') setDirFilter(arr => arr.filter(x => x !== c.id));
    if (c.kind === 'stage') setStageFilter(arr => arr.filter(x => x !== c.id));
    if (c.kind === 'region') setRegionFilter(arr => arr.filter(x => x !== c.id));
  };
  const resetAll = () => {
    setOrgFilter([]); setDirFilter([]); setStageFilter([]); setRegionFilter([]); setSearch('');
  };

  return (
    <div className="page-fade container" style={{ paddingTop: 32, paddingBottom: 40 }}>
      {/* Breadcrumb + title */}
      <nav style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 12 }}>
        <a onClick={() => go('home')} style={{ cursor: 'pointer' }}>Главная</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--color-text-2)' }}>Услуги</span>
      </nav>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Каталог услуг</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 6, marginBottom: 0 }}>
            Найдено <strong style={{ color: 'var(--color-text-2)' }}>{sorted.length}</strong> мер поддержки из {MOCK.SERVICES.length}
          </p>
        </div>
        <div style={{ position: 'relative', width: 380 }}>
          <I.Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            placeholder="Поиск по названию или описанию"
            style={{ paddingLeft: 38, height: 40 }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '264px 1fr', gap: 32 }}>
        {/* Sidebar filters */}
        <aside>
          <div className="card" style={{ padding: '4px 20px', position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                <I.Sliders size={16} /> Фильтры
              </div>
              {activeChips.length > 0 && (
                <button onClick={resetAll} className="btn btn-ghost btn-sm" style={{ height: 28, padding: '0 8px', fontSize: 12, color: 'var(--color-accent)' }}>
                  Сбросить
                </button>
              )}
            </div>
            <FilterGroup title="Организация" options={orgOptions} selected={orgFilter} onToggle={toggle(setOrgFilter)} />
            <FilterGroup title="Направление" options={dirOptions} selected={dirFilter} onToggle={toggle(setDirFilter)} />
            <FilterGroup title="Этап бизнеса" options={stageOptions} selected={stageFilter} onToggle={toggle(setStageFilter)} defaultOpen={false} />
            <FilterGroup title="Регион" options={regionOptions} selected={regionFilter} onToggle={toggle(setRegionFilter)} defaultOpen={false} />
          </div>
        </aside>

        {/* Results */}
        <main>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {activeChips.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--color-text-3)' }}>Без фильтров</span>
              ) : activeChips.map((c, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 4px 4px 10px', borderRadius: 999,
                  background: 'var(--color-accent-soft)', color: 'var(--color-primary)',
                  fontSize: 12, fontWeight: 500,
                }}>
                  {c.label}
                  <button onClick={() => removeChip(c)} style={{
                    width: 18, height: 18, borderRadius: '50%', border: 'none',
                    background: 'rgba(30,58,138,0.1)', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-primary)',
                  }}><I.X size={11} /></button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Сортировка:</span>
                <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ height: 36, width: 'auto', paddingRight: 30 }}>
                  <option value="popular">По популярности</option>
                  <option value="new">Сначала новые</option>
                </select>
              </div>
              <div style={{ display: 'inline-flex', background: 'var(--color-surface-2)', borderRadius: 6, padding: 2 }}>
                <button onClick={() => setView('grid')} style={{
                  width: 32, height: 32, border: 'none', borderRadius: 5,
                  background: view === 'grid' ? '#fff' : 'transparent',
                  color: view === 'grid' ? 'var(--color-text)' : 'var(--color-text-3)',
                  boxShadow: view === 'grid' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}><I.Grid size={15} /></button>
                <button onClick={() => setView('list')} style={{
                  width: 32, height: 32, border: 'none', borderRadius: 5,
                  background: view === 'list' ? '#fff' : 'transparent',
                  color: view === 'list' ? 'var(--color-text)' : 'var(--color-text-3)',
                  boxShadow: view === 'list' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}><I.List size={15} /></button>
              </div>
            </div>
          </div>

          {/* Cards */}
          {sorted.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--color-surface-2)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, color: 'var(--color-text-3)',
              }}><I.Search size={24} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 6 }}>Ничего не найдено</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: 0, marginBottom: 20 }}>
                Попробуйте изменить параметры поиска или сбросить фильтры
              </p>
              <button className="btn btn-primary" onClick={resetAll}>Сбросить фильтры</button>
            </div>
          ) : (
            <div style={{
              display: view === 'grid' ? 'grid' : 'flex',
              flexDirection: view === 'list' ? 'column' : undefined,
              gridTemplateColumns: view === 'grid' ? 'repeat(2, 1fr)' : undefined,
              gap: 16,
            }}>
              {sorted.map(s => <ServiceCard key={s.id} s={s} go={go} />)}
            </div>
          )}

          {/* Pagination */}
          {sorted.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32 }}>
              <button className="btn btn-secondary btn-sm" disabled><I.ChevronLeft size={14} /></button>
              {[1, 2, 3, '…', 8].map((p, i) => (
                <button key={i} className={p === 1 ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} disabled={p === '…'}
                  style={{ minWidth: 32, padding: 0 }}>{p}</button>
              ))}
              <button className="btn btn-secondary btn-sm"><I.ChevronRight size={14} /></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

window.ServicesPage = ServicesPage;
