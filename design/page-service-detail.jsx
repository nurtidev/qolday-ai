// ===== Service Detail =====

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 32 }}>
    {tabs.map(t => (
      <button key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 500,
          color: active === t.id ? 'var(--color-primary)' : 'var(--color-text-3)',
          borderBottom: active === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
          marginBottom: -1, transition: 'color 120ms',
        }}>
        {t.label}
      </button>
    ))}
  </div>
);

const ServiceDetailPage = ({ go, serviceId }) => {
  const s = MOCK.SERVICES.find(x => x.id === serviceId) || MOCK.SERVICES[0];
  const o = MOCK.orgById(s.org);
  const [tab, setTab] = React.useState('desc');
  const [bookmarked, setBookmarked] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState(0);
  const toast = useToast();

  const D = MOCK.SERVICE_DETAIL;

  const tabs = [
    { id: 'desc', label: 'Описание' },
    { id: 'cond', label: 'Условия' },
    { id: 'docs', label: 'Документы' },
    { id: 'how',  label: 'Как подать' },
  ];

  return (
    <div className="page-fade container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 16 }}>
        <a onClick={() => go('home')} style={{ cursor: 'pointer' }}>Главная</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <a onClick={() => go('services')} style={{ cursor: 'pointer' }}>Услуги</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--color-text-2)' }}>{s.title}</span>
      </nav>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <OrgBadge orgId={s.org} size="md" />
            <span className="badge badge-green badge-dot">Действующая программа</span>
            <span className="badge badge-gray">Обновлено {s.updated}</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2, maxWidth: 720 }}>
            {s.title}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--color-text-2)', marginTop: 12, marginBottom: 0, lineHeight: 1.55, maxWidth: 720 }}>
            {s.short}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => { setBookmarked(!bookmarked); toast.push(bookmarked ? 'Удалено из избранного' : 'Добавлено в избранное', 'success'); }}>
            <I.Bookmark size={16} style={{ color: bookmarked ? 'var(--color-accent)' : undefined, fill: bookmarked ? 'var(--color-accent)' : 'none' }} />
            {bookmarked ? 'В избранном' : 'В избранное'}
          </button>
          <button className="btn btn-secondary"><I.ExternalLink size={16} /></button>
        </div>
      </div>

      {/* Key params bar */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: 0, marginBottom: 32, overflow: 'hidden' }}>
        {[
          { l: 'Сумма финансирования', v: s.sumMax, icon: 'Coins' },
          { l: 'Процентная ставка',    v: s.rate,   icon: 'Hash' },
          { l: 'Срок',                 v: s.term,   icon: 'Clock' },
          { l: 'Срок рассмотрения',    v: '10 раб. дней', icon: 'Calendar' },
        ].map((k, i) => {
          const Ic = I[k.icon];
          return (
            <div key={i} style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid var(--color-border)' : 'none', display: 'flex', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic size={18} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 2 }}>{k.l}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{k.v}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-col: tabs + sticky sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        <main>
          <Tabs tabs={tabs} active={tab} onChange={setTab} />

          {tab === 'desc' && (
            <div className="page-fade">
              <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 12 }}>О программе</h2>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text-2)', marginTop: 0 }}>
                Программа направлена на поддержку субъектов малого и среднего предпринимательства Республики Казахстан, реализующих проекты в приоритетных секторах экономики. Финансирование предоставляется на расширение деятельности, пополнение оборотных средств и приобретение основных средств.
              </p>

              <div style={{ background: 'var(--color-info-soft)', border: '1px solid #BAE6FD', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, marginTop: 24, marginBottom: 32 }}>
                <I.Info size={20} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 14, color: '#0C4A6E', lineHeight: 1.55 }}>
                  Заявки принимаются круглосуточно. Решение по заявке принимается в течение 10 рабочих дней с момента подачи полного пакета документов.
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Ключевые преимущества</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
                {D.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 8 }}>
                    <I.Check size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 1 }} strokeWidth={2.5} />
                    <span style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.45 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'cond' && (
            <div className="page-fade">
              <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>Кто может подать заявку</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {D.requirements.map((r, i) => (
                  <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--color-success-soft)', color: 'var(--color-success)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}><I.Check size={13} strokeWidth={3} /></div>
                    <span style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.5, paddingTop: 1 }}>{r}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--color-warning-soft)', border: '1px solid #FCD34D', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12 }}>
                <I.Alert size={20} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 14, color: '#92400E', lineHeight: 1.55 }}>
                  <strong>Не финансируются:</strong> производство и реализация подакцизных товаров, операции с ценными бумагами, деятельность ломбардов и игорный бизнес.
                </div>
              </div>
            </div>
          )}

          {tab === 'docs' && (
            <div className="page-fade">
              <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>Необходимые документы</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {D.documents.map((d, i) => (
                  <div key={i} style={{
                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    borderBottom: i < D.documents.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <div style={{
                      width: 40, height: 48, borderRadius: 6,
                      background: d.type === 'PDF' ? '#FEE2E2' : d.type === 'XLSX' ? '#D1FAE5' : '#DBEAFE',
                      color:      d.type === 'PDF' ? '#B91C1C' : d.type === 'XLSX' ? '#047857' : '#1E40AF',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>{d.type}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>{d.size}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent)' }}>
                      <I.Download size={15} /> Скачать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'how' && (
            <div className="page-fade">
              <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 24 }}>Процесс подачи заявки</h2>
              <div style={{ position: 'relative' }}>
                {/* timeline line */}
                <div style={{ position: 'absolute', left: 18, top: 18, bottom: 18, width: 2, background: 'var(--color-border)' }} />
                {D.steps.map((st, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20, position: 'relative' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: i === 0 ? 'var(--color-primary)' : '#fff',
                      color: i === 0 ? '#fff' : 'var(--color-text-2)',
                      border: '2px solid ' + (i === 0 ? 'var(--color-primary)' : 'var(--color-border-strong)'),
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, flexShrink: 0, zIndex: 1,
                    }}>{st.n}</div>
                    <div className="card" style={{ flex: 1, padding: '14px 18px' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{st.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4 }}>{st.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>Часто задаваемые вопросы</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {D.faq.map((f, i) => (
                <div key={i} style={{ borderBottom: i < D.faq.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{
                    width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{f.q}</span>
                    <I.ChevronDown size={16} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms', color: 'var(--color-text-3)', flexShrink: 0 }} />
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 20px 20px', fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Sticky sidebar */}
        <aside>
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4 }}>Готовы подать заявку?</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, lineHeight: 1.4 }}>
                Заполнение займёт около 8 минут
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => go('apply', { id: s.id })}>
                Подать заявку <I.ArrowRight size={16} />
              </button>
              <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }}>
                <I.Document size={16} /> Скачать памятку
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 12px', background: 'var(--color-success-soft)', borderRadius: 8 }}>
                <I.Lock size={14} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: 12, color: '#047857' }}>Защищённое подключение через eGov</span>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Организация</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 8,
                  background: o.color, color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700,
                }}>{o.tag}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{o.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Дочерняя организация Холдинга «Байтерек»</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--color-text-2)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><I.Phone size={14} style={{ color: 'var(--color-text-3)' }} />+7 (7172) 79-70-70</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><I.Mail size={14} style={{ color: 'var(--color-text-3)' }} />info@{o.id}.kz</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><I.MapPin size={14} style={{ color: 'var(--color-text-3)', marginTop: 2 }} />г. Астана, пр. Мангилик Ел, 55А</div>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Похожие услуги</div>
              {MOCK.SERVICES.filter(x => x.dir === s.dir && x.id !== s.id).slice(0, 3).map(rs => (
                <a key={rs.id} onClick={() => go('service', { id: rs.id })} style={{
                  display: 'block', padding: '12px 0',
                  borderTop: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{rs.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{MOCK.orgById(rs.org).short} · до {rs.sumMax}</div>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

window.ServiceDetailPage = ServiceDetailPage;
