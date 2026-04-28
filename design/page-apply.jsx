// ===== Application Wizard (3 steps) =====

const Stepper = ({ steps, current }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: done ? 'var(--color-success)' : active ? 'var(--color-primary)' : '#fff',
              color: done || active ? '#fff' : 'var(--color-text-3)',
              border: !done && !active ? '2px solid var(--color-border-strong)' : 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, transition: 'all 200ms',
            }}>
              {done ? <I.Check size={14} strokeWidth={3} /> : i + 1}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Шаг {i + 1}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: active ? 'var(--color-text)' : done ? 'var(--color-text-2)' : 'var(--color-text-3)' }}>
                {s}
              </div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2,
              background: done ? 'var(--color-success)' : 'var(--color-border)',
              margin: '0 20px', borderRadius: 2, transition: 'background 200ms',
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const FileItem = ({ f, onRemove }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 8,
  }}>
    <div style={{
      width: 36, height: 44, borderRadius: 5,
      background: '#FEE2E2', color: '#B91C1C',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700, flexShrink: 0,
    }}>{f.type}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <div style={{ flex: 1, height: 4, background: 'var(--color-surface-2)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${f.progress}%`, background: f.progress === 100 ? 'var(--color-success)' : 'var(--color-accent)', transition: 'width 300ms' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums', minWidth: 80, textAlign: 'right' }}>
          {f.progress < 100 ? `${f.progress}% · ${f.size}` : `${f.size} · загружено`}
        </span>
      </div>
    </div>
    <button onClick={onRemove} className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0, color: 'var(--color-text-3)' }}>
      <I.Trash size={14} />
    </button>
  </div>
);

const ApplyPage = ({ go, serviceId }) => {
  const s = MOCK.SERVICES.find(x => x.id === serviceId) || MOCK.SERVICES[0];
  const toast = useToast();
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    fullName: 'Аскаров Нурлан Болатович',
    iin: '870615301425',
    phone: '+7 (701) 234 56 78',
    email: 'n.askarov@mail.kz',
    company: 'ТОО «Сары-Арка Агро»',
    bin: '180840012345',
    region: 'Акмолинская область',
    employees: '24',
    sumRequested: '',
    purpose: '',
    description: '',
    consent: false,
  });
  const [errors, setErrors] = React.useState({});
  const [files, setFiles] = React.useState([
    { id: 1, name: 'Бизнес-план_2026.pdf', type: 'PDF', size: '2.4 МБ', progress: 100 },
  ]);
  const [signing, setSigning] = React.useState(false);

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.fullName) e.fullName = 'Укажите ФИО';
    if (!form.iin || form.iin.length < 12) e.iin = 'ИИН должен содержать 12 цифр';
    if (!form.phone) e.phone = 'Укажите телефон';
    if (!form.email || !form.email.includes('@')) e.email = 'Некорректный email';
    if (!form.company) e.company = 'Укажите название компании';
    if (!form.bin || form.bin.length < 12) e.bin = 'БИН должен содержать 12 цифр';
    if (!form.sumRequested) e.sumRequested = 'Укажите запрашиваемую сумму';
    if (!form.purpose) e.purpose = 'Выберите цель';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateStep1()) {
      toast.push('Проверьте обязательные поля', 'error');
      return;
    }
    if (step === 1 && files.length < 1) {
      toast.push('Загрузите хотя бы один документ', 'error');
      return;
    }
    setStep(s => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const prev = () => setStep(s => Math.max(s - 1, 0));

  // Simulate upload
  const handleFiles = (newFiles) => {
    newFiles.forEach((f, idx) => {
      const id = Date.now() + idx;
      const sizeKb = Math.floor(Math.random() * 3000) + 500;
      const sizeStr = sizeKb > 1024 ? `${(sizeKb/1024).toFixed(1)} МБ` : `${sizeKb} КБ`;
      setFiles(prev => [...prev, { id, name: f, type: f.split('.').pop().toUpperCase(), size: sizeStr, progress: 0 }]);
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 25 + 8;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          toast.push(`Файл «${f}» загружен`, 'success');
        }
        setFiles(prev => prev.map(x => x.id === id ? { ...x, progress: Math.round(p) } : x));
      }, 250);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    const sample = ['Финансовая_отчётность_2024.xlsx', 'Учредительные_документы.pdf', 'Справка_о_задолженностях.pdf'];
    const next = sample[files.length % sample.length];
    handleFiles([next]);
  };

  const submit = () => {
    if (!form.consent) {
      toast.push('Подтвердите согласие на обработку данных', 'error');
      return;
    }
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      toast.push('Заявка успешно подана. Номер: QA-2026-001847', 'success');
      go('home');
    }, 2200);
  };

  return (
    <div className="page-fade container" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 980 }}>
      <nav style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 16 }}>
        <a onClick={() => go('home')} style={{ cursor: 'pointer' }}>Главная</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <a onClick={() => go('services')} style={{ cursor: 'pointer' }}>Услуги</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <a onClick={() => go('service', { id: s.id })} style={{ cursor: 'pointer' }}>{s.title}</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--color-text-2)' }}>Подача заявки</span>
      </nav>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Подача заявки</h1>
        <div style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <OrgBadge orgId={s.org} /> · <span>{s.title}</span>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <Stepper steps={['Данные', 'Документы', 'Подтверждение']} current={step} />

        {step === 0 && (
          <div className="page-fade">
            {/* eGov pre-fill banner */}
            <div style={{
              background: 'var(--color-success-soft)', border: '1px solid #A7F3D0',
              borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, marginBottom: 28,
            }}>
              <I.CheckCircle size={20} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 14, color: '#065F46', lineHeight: 1.55 }}>
                <strong>Данные подгружены из eGov.</strong> Проверьте корректность и при необходимости отредактируйте поля.
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Личные данные</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <Field label="ФИО" required value={form.fullName} onChange={(v) => update('fullName', v)} error={errors.fullName} />
              <Field label="ИИН" required value={form.iin} onChange={(v) => update('iin', v)} error={errors.iin} hint="12 цифр" />
              <Field label="Контактный телефон" required value={form.phone} onChange={(v) => update('phone', v)} error={errors.phone} />
              <Field label="Email" required value={form.email} onChange={(v) => update('email', v)} error={errors.email} />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Данные компании</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <Field label="Наименование организации" required value={form.company} onChange={(v) => update('company', v)} error={errors.company} colSpan={2} />
              <Field label="БИН" required value={form.bin} onChange={(v) => update('bin', v)} error={errors.bin} />
              <Field label="Численность сотрудников" value={form.employees} onChange={(v) => update('employees', v)} />
              <SelectField label="Регион" required value={form.region} onChange={(v) => update('region', v)} colSpan={2}
                options={['г. Астана', 'г. Алматы', 'г. Шымкент', 'Акмолинская область', 'Алматинская область', 'Карагандинская область']} />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Параметры финансирования</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Field label="Запрашиваемая сумма (₸)" required value={form.sumRequested} onChange={(v) => update('sumRequested', v.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))} error={errors.sumRequested} placeholder="Например: 50 000 000" />
              <SelectField label="Цель финансирования" required value={form.purpose} onChange={(v) => update('purpose', v)} error={errors.purpose}
                options={['', 'Пополнение оборотных средств', 'Приобретение основных средств', 'Расширение производства', 'Рефинансирование']}
                placeholder="Выберите цель" />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label className="field-label">Краткое описание проекта</label>
              <textarea className="textarea" placeholder="Опишите проект, который планируется финансировать (необязательно)"
                value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="page-fade">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>Загрузите документы</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 0, marginBottom: 20 }}>
              Допустимые форматы: PDF, DOCX, XLSX, JPG, PNG. Максимальный размер файла — 20 МБ.
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-accent-soft)'; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.background = 'var(--color-surface-2)'; }}
              onDrop={onDrop}
              onClick={onDrop}
              style={{
                border: '2px dashed var(--color-border-strong)',
                borderRadius: 12, padding: '36px 24px',
                textAlign: 'center', cursor: 'pointer',
                background: 'var(--color-surface-2)',
                transition: 'all 160ms', marginBottom: 20,
              }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#fff', color: 'var(--color-accent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: 'var(--sh-sm)',
              }}><I.Upload size={24} /></div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Перетащите файлы сюда или нажмите для выбора</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 6 }}>До 20 МБ на файл</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
              {files.map(f => (
                <FileItem key={f.id} f={f}
                  onRemove={() => setFiles(prev => prev.filter(x => x.id !== f.id))} />
              ))}
            </div>

            <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--color-info-soft)', borderRadius: 10, border: '1px solid #BAE6FD', display: 'flex', gap: 12 }}>
              <I.Info size={18} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: '#0C4A6E', lineHeight: 1.55 }}>
                Загружено <strong>{files.length}</strong> из 5 рекомендуемых документов. Недостающие файлы можно будет приложить после создания заявки.
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="page-fade">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Проверьте данные</h3>
            <ReviewBlock title="Заявитель" rows={[
              ['ФИО', form.fullName],
              ['ИИН', form.iin],
              ['Телефон', form.phone],
              ['Email', form.email],
            ]} />
            <ReviewBlock title="Компания" rows={[
              ['Наименование', form.company],
              ['БИН', form.bin],
              ['Регион', form.region],
              ['Сотрудников', form.employees],
            ]} />
            <ReviewBlock title="Параметры заявки" rows={[
              ['Услуга', s.title],
              ['Сумма', form.sumRequested ? `${form.sumRequested} ₸` : '—'],
              ['Цель', form.purpose || '—'],
            ]} />
            <ReviewBlock title={`Документы (${files.length})`} rows={files.map(f => [f.type, f.name])} />

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'var(--color-surface-2)', borderRadius: 8, cursor: 'pointer', marginTop: 12 }}>
              <input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--color-accent)' }} />
              <span style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.55 }}>
                Я подтверждаю достоверность предоставленной информации и даю согласие на обработку персональных данных в соответствии с законодательством Республики Казахстан.
              </span>
            </label>

            <div style={{ marginTop: 20, padding: 18, border: '1px solid var(--color-border)', borderRadius: 10, background: '#FAFCFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <I.Shield size={18} style={{ color: 'var(--color-primary)' }} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>Электронная цифровая подпись</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 14, lineHeight: 1.55 }}>
                Заявка будет подписана с помощью вашего ЭЦП. Убедитесь, что NCALayer запущен на вашем устройстве.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-success)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
                NCALayer подключён · сертификат RSA-2048
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          {step > 0 ? (
            <button className="btn btn-secondary" onClick={prev}><I.ArrowLeft size={16} />Назад</button>
          ) : (
            <button className="btn btn-ghost" onClick={() => go('service', { id: s.id })}>Отменить</button>
          )}
          {step < 2 ? (
            <button className="btn btn-primary" onClick={next}>Продолжить <I.ArrowRight size={16} /></button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={submit} disabled={signing}>
              {signing ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 700ms linear infinite' }} />
                  Подписание ЭЦП…
                </>
              ) : (
                <><I.Shield size={16} />Подписать и отправить</>
              )}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const Field = ({ label, value, onChange, required, error, hint, placeholder, colSpan }) => (
  <div style={{ gridColumn: colSpan === 2 ? '1 / -1' : undefined }}>
    <label className="field-label">{label}{required && <span className="req">*</span>}</label>
    <input className={'input' + (error ? ' is-error' : '')} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    {error ? <div className="field-error"><I.Alert size={12} />{error}</div> : hint ? <div className="field-help">{hint}</div> : null}
  </div>
);

const SelectField = ({ label, value, onChange, options, required, error, placeholder, colSpan }) => (
  <div style={{ gridColumn: colSpan === 2 ? '1 / -1' : undefined, position: 'relative' }}>
    <label className="field-label">{label}{required && <span className="req">*</span>}</label>
    <select className={'select' + (error ? ' is-error' : '')} value={value} onChange={(e) => onChange(e.target.value)}
      style={{ appearance: 'none', backgroundImage: 'none', paddingRight: 36 }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.filter(o => o).map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
    <I.ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 38, color: 'var(--color-text-3)', pointerEvents: 'none' }} />
    {error && <div className="field-error"><I.Alert size={12} />{error}</div>}
  </div>
);

const ReviewBlock = ({ title, rows }) => (
  <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
    <div style={{ padding: '10px 16px', background: 'var(--color-surface-2)', fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '180px 1fr',
          padding: '10px 16px', fontSize: 13,
          borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
        }}>
          <span style={{ color: 'var(--color-text-3)' }}>{r[0]}</span>
          <span style={{ color: 'var(--color-text)' }}>{r[1] || '—'}</span>
        </div>
      ))}
    </div>
  </div>
);

window.ApplyPage = ApplyPage;
