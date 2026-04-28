// ===== FormBuilder — Admin: создание/редактирование услуги =====

const FIELD_TYPES = [
  { id: 'text',       label: 'Текст',          icon: 'Document', desc: 'Однострочное поле' },
  { id: 'textarea',   label: 'Длинный текст',  icon: 'Document', desc: 'Многострочное поле' },
  { id: 'number',     label: 'Число',          icon: 'Hash',     desc: 'Числовое значение' },
  { id: 'currency',   label: 'Сумма',          icon: 'Coins',    desc: 'Валютная маска' },
  { id: 'select',     label: 'Выпадающий список', icon: 'List',  desc: 'Выбор одного из…' },
  { id: 'radio',      label: 'Переключатели',  icon: 'CheckCircle', desc: 'Один из вариантов' },
  { id: 'checkbox',   label: 'Чекбокс',        icon: 'Check',    desc: 'Да / нет' },
  { id: 'date',       label: 'Дата',           icon: 'Calendar', desc: 'Календарь' },
  { id: 'file',       label: 'Файл',           icon: 'Upload',   desc: 'Загрузка документов' },
  { id: 'calculated', label: 'Вычисляемое',    icon: 'Sparkle',  desc: 'Формула из других полей' },
];

const TYPE_BY_ID = Object.fromEntries(FIELD_TYPES.map(t => [t.id, t]));

// Стартовая схема (то, что увидит пользователь, когда открывает /admin/services/new)
const DEFAULT_SCHEMA = {
  meta: { title: '', dir: '', org: '', description: '', status: 'draft' },
  steps: [
    {
      id: 's1', title: 'Информация о компании', condition: null,
      fields: [
        { id: 'f1', type: 'text',     label: 'Название компании', placeholder: 'ТОО «...»', required: true, autofill: 'egov.org_name' },
        { id: 'f2', type: 'text',     label: 'БИН',                placeholder: '12 цифр',  required: true, autofill: 'egov.bin', mask: '12 digits' },
        { id: 'f3', type: 'select',   label: 'Размер бизнеса',     required: true,
          options: ['Микробизнес', 'МСБ', 'Крупный бизнес'] },
      ],
    },
    {
      id: 's2', title: 'Параметры финансирования', condition: { field: 'f3', op: '=', value: 'МСБ' },
      fields: [
        { id: 'f4', type: 'currency',   label: 'Запрашиваемая сумма', placeholder: '0', required: true, currency: '₸' },
        { id: 'f5', type: 'number',     label: 'Срок (мес.)',         required: true, min: 6, max: 84 },
        { id: 'f6', type: 'calculated', label: 'Ежемесячный платёж',  formula: 'f4 / f5 * 1.09' },
      ],
    },
    {
      id: 's3', title: 'Документы', condition: null,
      fields: [
        { id: 'f7', type: 'file',     label: 'Финансовая отчётность за 2024', required: true, accept: '.pdf,.xlsx' },
        { id: 'f8', type: 'file',     label: 'Бизнес-план',                   required: false, accept: '.pdf,.docx' },
      ],
    },
  ],
};

// ===== Sub-components =====

const FBLeftPanel = ({ schema, setSchema, onPublish, onSaveDraft, saving }) => {
  const set = (k, v) => setSchema(s => ({ ...s, meta: { ...s.meta, [k]: v } }));
  return (
    <aside style={{
      width: 300, flexShrink: 0, borderRight: '1px solid var(--color-border)',
      background: '#fff', padding: '24px 22px', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 6 }}>Настройки услуги</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Эти поля видны в каталоге</div>
      </div>

      <div>
        <label className="field-label">Название услуги<span className="req">*</span></label>
        <input className="input" placeholder="Льготный кредит для МСБ"
          value={schema.meta.title} onChange={(e) => set('title', e.target.value)} />
      </div>
      <div>
        <label className="field-label">Категория<span className="req">*</span></label>
        <select className="select" value={schema.meta.dir} onChange={(e) => set('dir', e.target.value)} style={{ appearance: 'none' }}>
          <option value="">Выберите категорию</option>
          {MOCK.DIRECTIONS.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
      </div>
      <div>
        <label className="field-label">Организация<span className="req">*</span></label>
        <select className="select" value={schema.meta.org} onChange={(e) => set('org', e.target.value)} style={{ appearance: 'none' }}>
          <option value="">Выберите институт</option>
          {MOCK.ORGS.map(o => <option key={o.id} value={o.id}>{o.short} · {o.name}</option>)}
        </select>
      </div>
      <div>
        <label className="field-label">Краткое описание</label>
        <textarea className="textarea" placeholder="2–3 предложения о программе"
          value={schema.meta.description} onChange={(e) => set('description', e.target.value)}
          style={{ minHeight: 100 }} />
      </div>

      <div style={{
        marginTop: 4, padding: '12px 14px', background: 'var(--color-surface-2)',
        borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.5,
      }}>
        <I.Info size={14} style={{ float: 'left', marginRight: 8, color: 'var(--color-accent)' }} />
        Заявки по этой услуге будут поступать в раздел <strong style={{ color: 'var(--color-text-2)' }}>Заявки</strong> и автоматически назначаться сотрудникам выбранной организации.
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
        <button className="btn btn-primary btn-block" onClick={onPublish} disabled={saving === 'publish'}>
          {saving === 'publish'
            ? <><span className="spinner" />Публикация…</>
            : <><I.Check size={16} />Опубликовать</>}
        </button>
        <button className="btn btn-secondary btn-block" onClick={onSaveDraft} disabled={saving === 'draft'}>
          {saving === 'draft' ? <><span className="spinner" />Сохранение…</> : 'Сохранить черновик'}
        </button>
        <div style={{ fontSize: 11, color: 'var(--color-text-3)', textAlign: 'center', marginTop: 4 }}>
          Автосохранение: <span style={{ color: 'var(--color-success)' }}>● 12 сек назад</span>
        </div>
      </div>
    </aside>
  );
};

// ----- AI block -----
const FBAiBlock = ({ onApply }) => {
  const [prompt, setPrompt] = React.useState('Льготный кредит для микробизнеса под залог сельхозтехники, до 50 млн тенге, срок до 5 лет');
  const [state, setState]   = React.useState('idle'); // idle | loading | success | error
  const [progress, setProgress] = React.useState(0);
  const [generated, setGenerated] = React.useState(null);
  const toast = useToast();

  const generate = async () => {
    if (!prompt.trim()) { toast.push('Опишите услугу для генерации', 'error'); return; }
    setState('loading');
    setProgress(0);

    // Имитация прогресса (UX)
    const tick = setInterval(() => setProgress(p => Math.min(p + 7, 92)), 220);

    try {
      // Реальный вызов через window.claude.complete (бэк позже заменит на /api/ai/generate-form)
      const sys = `Ты помощник по созданию форм заявок для портала господдержки бизнеса в Казахстане.
По описанию услуги верни JSON-схему формы со следующей структурой (БЕЗ комментариев, только JSON):
{
  "steps": [
    { "title": "Название этапа",
      "fields": [
        { "type": "text|textarea|number|currency|select|date|file|calculated",
          "label": "...", "required": true|false,
          "options": [...] // для select,
          "formula": "..." // для calculated
        }
      ]
    }
  ]
}
2-4 этапа, 3-6 полей в каждом. На русском языке.`;
      const reply = await window.claude.complete({
        messages: [{ role: 'user', content: sys + '\n\nОписание услуги: ' + prompt }],
      });
      clearInterval(tick);
      setProgress(100);

      // Извлекаем JSON
      const m = reply.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : null;
      if (!parsed || !parsed.steps) throw new Error('Invalid schema');

      // Назначаем id
      const schema = {
        steps: parsed.steps.map((s, i) => ({
          id: 's' + (i + 1) + '_ai',
          title: s.title || `Этап ${i + 1}`,
          condition: null,
          fields: (s.fields || []).map((f, j) => ({
            id: 'f' + (i + 1) + '_' + (j + 1) + '_ai',
            type: f.type || 'text',
            label: f.label || 'Поле',
            required: !!f.required,
            options: f.options,
            formula: f.formula,
            placeholder: f.placeholder,
          })),
        })),
      };
      setGenerated(schema);
      setState('success');
      toast.push('Форма сгенерирована', 'success');
    } catch (e) {
      clearInterval(tick);
      setState('error');
      toast.push('Ошибка генерации. Попробуйте ещё раз', 'error');
    }
  };

  if (state === 'success' && generated) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 100%)',
        border: '1px solid #C7D2FE', borderRadius: 12, padding: 20, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <I.CheckCircle size={16} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Готово · {generated.steps.length} этап(ов), {generated.steps.reduce((n, s) => n + s.fields.length, 0)} полей</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 14 }}>
          Claude сгенерировал черновик формы. Проверьте поля и применить к холсту — заменит текущие этапы.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => { onApply(generated); setState('idle'); setGenerated(null); }}>
            <I.Check size={14} />Применить к холсту
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setState('idle'); setGenerated(null); }}>Отменить</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm" onClick={generate}><I.Sparkle size={14} />Пересоздать</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
      borderRadius: 12, padding: 20, marginBottom: 24, color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -50, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <I.Sparkle size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>AI-конструктор формы</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Опишите услугу — Claude сгенерирует структуру</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 10, padding: '3px 8px', background: 'rgba(255,255,255,0.18)', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Claude Sonnet 4</span>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Например: льготный кредит для МСБ под 9% годовых, сумма до 100 млн тенге, для новых производств в перерабатывающей промышленности…"
          disabled={state === 'loading'}
          style={{
            width: '100%', minHeight: 80, marginTop: 12,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8, padding: '10px 14px', color: '#fff', fontFamily: 'inherit',
            fontSize: 14, lineHeight: 1.5, resize: 'vertical', outline: 'none',
          }}
        />

        {state === 'loading' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span><span className="spinner-light" />&nbsp;Claude анализирует описание и подбирает поля…</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#fff', transition: 'width 220ms ease' }} />
            </div>
          </div>
        )}

        {state !== 'loading' && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={generate} style={{
              height: 38, padding: '0 18px', borderRadius: 8, border: 'none',
              background: '#fff', color: 'var(--color-primary)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <I.Sparkle size={15} />Сгенерировать форму через AI
            </button>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
              POST /api/ai/generate-form · ≈ 8–14 сек
            </span>
            {state === 'error' && (
              <span style={{ fontSize: 12, color: '#FCA5A5', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <I.Alert size={13} />Ошибка генерации
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ----- Single field row -----
const FBFieldRow = ({ field, selected, onSelect, onMove, onDelete, canUp, canDown }) => {
  const t = TYPE_BY_ID[field.type] || TYPE_BY_ID.text;
  const Ic = I[t.icon] || I.Document;
  const isCalc = field.type === 'calculated';

  return (
    <div onClick={onSelect} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: selected ? 'var(--color-accent-soft)' : '#fff',
      border: '1px solid ' + (selected ? 'var(--color-accent)' : 'var(--color-border)'),
      borderRadius: 8, cursor: 'pointer', marginBottom: 8,
      transition: 'all 120ms',
      boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
    }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.background = 'var(--color-surface-2)'; }}}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = '#fff'; }}}
    >
      <div title="Перетащите для изменения порядка"
        style={{ color: 'var(--color-text-4)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 2, fontSize: 14, lineHeight: 0.6, userSelect: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >⠿</div>

      <div style={{
        width: 32, height: 32, borderRadius: 6, flexShrink: 0,
        background: isCalc ? 'rgba(59,130,246,0.12)' : 'var(--color-surface-2)',
        color: isCalc ? 'var(--color-accent)' : 'var(--color-text-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ic size={15} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, color: isCalc ? 'var(--color-accent)' : 'var(--color-text)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.label || <em style={{ color: 'var(--color-text-4)' }}>Без названия</em>}</span>
          {field.required && <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>*</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-3)', display: 'flex', gap: 8, marginTop: 2 }}>
          <span>{t.label}</span>
          {field.autofill && <><span>·</span><span style={{ color: 'var(--color-accent)' }}>eGov: {field.autofill.split('.')[1]}</span></>}
          {field.formula && <><span>·</span><span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-accent)' }}>= {field.formula}</span></>}
          {field.options && <><span>·</span><span>{field.options.length} опций</span></>}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 2 }}>
        <button className="btn btn-ghost btn-sm" disabled={!canUp} onClick={() => onMove(-1)}
          style={{ width: 28, padding: 0 }} title="Вверх"><I.ChevronUp size={14} /></button>
        <button className="btn btn-ghost btn-sm" disabled={!canDown} onClick={() => onMove(1)}
          style={{ width: 28, padding: 0 }} title="Вниз"><I.ChevronDown size={14} /></button>
        <button className="btn btn-ghost btn-sm" onClick={onDelete}
          style={{ width: 28, padding: 0, color: 'var(--color-text-3)' }} title="Удалить"><I.Trash size={14} /></button>
      </div>
    </div>
  );
};

// ----- Add field popover -----
const FBAddFieldMenu = ({ onPick, onClose }) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
    <div onClick={(e) => e.stopPropagation()} style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 540, background: '#fff', borderRadius: 12, boxShadow: 'var(--sh-xl)',
      padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Выберите тип поля</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: 28, padding: 0 }}><I.X size={14} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {FIELD_TYPES.map(t => {
          const Ic = I[t.icon] || I.Document;
          const isCalc = t.id === 'calculated';
          return (
            <button key={t.id} onClick={() => onPick(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              background: '#fff', border: '1px solid var(--color-border)', borderRadius: 8,
              cursor: 'pointer', textAlign: 'left',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-accent-soft)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = '#fff'; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 6,
                background: isCalc ? 'rgba(59,130,246,0.12)' : 'var(--color-surface-2)',
                color: isCalc ? 'var(--color-accent)' : 'var(--color-text-2)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}><Ic size={15} /></div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{t.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ----- Step container -----
const FBStep = ({ step, idx, total, selectedId, onSelectField, onUpdateStep, onRemoveStep, onAddField, onUpdateField, onMoveField, onDeleteField, onMoveStep }) => {
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);

  const addField = (type) => {
    const t = TYPE_BY_ID[type];
    onAddField({
      id: 'f_' + Math.random().toString(36).slice(2, 7),
      type, label: 'Новое поле (' + t.label.toLowerCase() + ')',
      required: false,
      ...(type === 'select' || type === 'radio' ? { options: ['Вариант 1', 'Вариант 2'] } : {}),
      ...(type === 'calculated' ? { formula: '' } : {}),
    });
    setShowAdd(false);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Step condition divider */}
      {step.condition && idx > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px',
          padding: '10px 16px', background: '#FFFBEB', border: '1px dashed #FCD34D',
          borderRadius: 8, fontSize: 13, color: '#92400E',
        }}>
          <I.Filter size={14} />
          <span>Этот этап показывается, если <code style={{ background: 'rgba(0,0,0,0.05)', padding: '1px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{step.condition.field} {step.condition.op} "{step.condition.value}"</code></span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: 12 }}>Изменить</button>
        </div>
      )}

      <div style={{
        background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20,
        boxShadow: 'var(--sh-xs)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)',
            color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600,
          }}>{idx + 1}</div>

          {editingTitle ? (
            <input autoFocus className="input" value={step.title}
              onChange={(e) => onUpdateStep({ ...step, title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(false); }}
              style={{ flex: 1, fontSize: 16, fontWeight: 600, height: 36, border: '1px solid var(--color-accent)' }}
            />
          ) : (
            <h3 onClick={() => setEditingTitle(true)} style={{
              flex: 1, fontSize: 16, fontWeight: 600, margin: 0, cursor: 'text',
              padding: '6px 8px', borderRadius: 6,
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Этап {idx + 1}: {step.title}
              <I.Document size={13} style={{ marginLeft: 8, color: 'var(--color-text-4)', verticalAlign: 'middle' }} />
            </h3>
          )}

          <span className="badge badge-gray">{step.fields.length} {step.fields.length === 1 ? 'поле' : 'полей'}</span>

          <div style={{ display: 'flex', gap: 2 }}>
            <button className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => onMoveStep(-1)} style={{ width: 28, padding: 0 }} title="Вверх"><I.ChevronUp size={14} /></button>
            <button className="btn btn-ghost btn-sm" disabled={idx === total - 1} onClick={() => onMoveStep(1)} style={{ width: 28, padding: 0 }} title="Вниз"><I.ChevronDown size={14} /></button>
            <button className="btn btn-ghost btn-sm" onClick={onRemoveStep} style={{ width: 28, padding: 0, color: 'var(--color-text-3)' }} title="Удалить этап"><I.Trash size={14} /></button>
          </div>
        </div>

        {step.fields.length === 0 && (
          <div style={{
            padding: 28, textAlign: 'center', borderRadius: 8,
            border: '2px dashed var(--color-border)', color: 'var(--color-text-3)',
            fontSize: 13, marginBottom: 8,
          }}>На этом этапе пока нет полей</div>
        )}

        {step.fields.map((f, i) => (
          <FBFieldRow key={f.id} field={f}
            selected={selectedId === f.id}
            onSelect={() => onSelectField(f.id)}
            onMove={(dir) => onMoveField(i, dir)}
            onDelete={() => onDeleteField(i)}
            canUp={i > 0} canDown={i < step.fields.length - 1}
          />
        ))}

        <button onClick={() => setShowAdd(true)} style={{
          width: '100%', height: 40, marginTop: 4,
          background: 'transparent', border: '1.5px dashed var(--color-border-strong)',
          borderRadius: 8, color: 'var(--color-text-2)',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all 120ms',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-accent-soft)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-2)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <I.Plus size={15} />Добавить поле
        </button>
      </div>

      {showAdd && <FBAddFieldMenu onPick={addField} onClose={() => setShowAdd(false)} />}
    </div>
  );
};

// ----- Right panel: field settings -----
const FBRightPanel = ({ field, allFieldRefs, onChange, onClose }) => {
  if (!field) {
    return (
      <aside style={{
        width: 320, flexShrink: 0, borderLeft: '1px solid var(--color-border)',
        background: '#fff', padding: '40px 24px', overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-3)', marginTop: 60 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <I.Sliders size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 6 }}>Настройки поля</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>Кликните на поле в холсте, чтобы изменить его свойства</div>
        </div>
      </aside>
    );
  }

  const set = (k, v) => onChange({ ...field, [k]: v });
  const setOpt = (i, v) => set('options', field.options.map((x, j) => j === i ? v : x));

  return (
    <aside style={{
      width: 320, flexShrink: 0, borderLeft: '1px solid var(--color-border)',
      background: '#fff', overflowY: 'auto',
    }}>
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {(() => { const Ic = I[(TYPE_BY_ID[field.type] || {}).icon || 'Document']; return <Ic size={15} />; })()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Настройки поля</div>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.label || '—'}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: 28, padding: 0 }}><I.X size={14} /></button>
      </div>

      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <label className="field-label">Заголовок</label>
          <input className="input" value={field.label || ''} onChange={(e) => set('label', e.target.value)} />
        </div>

        <div>
          <label className="field-label">Тип поля</label>
          <select className="select" value={field.type} onChange={(e) => set('type', e.target.value)} style={{ appearance: 'none' }}>
            {FIELD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        {!['file', 'calculated', 'checkbox'].includes(field.type) && (
          <div>
            <label className="field-label">Подсказка (placeholder)</label>
            <input className="input" value={field.placeholder || ''} onChange={(e) => set('placeholder', e.target.value)}
              placeholder="Например: введите ИИН" />
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Обязательное поле</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Не пройти этап без заполнения</div>
          </div>
          <span onClick={() => set('required', !field.required)} style={{
            width: 36, height: 20, borderRadius: 999, position: 'relative', cursor: 'pointer',
            background: field.required ? 'var(--color-success)' : 'var(--color-border-strong)',
            transition: 'background 120ms',
          }}>
            <span style={{
              position: 'absolute', top: 2, left: field.required ? 18 : 2,
              width: 16, height: 16, background: '#fff', borderRadius: '50%',
              transition: 'left 120ms',
            }} />
          </span>
        </label>

        {(field.type === 'select' || field.type === 'radio') && (
          <div>
            <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Варианты</span>
              <button className="btn btn-ghost btn-sm" style={{ height: 22, fontSize: 12, padding: '0 6px' }}
                onClick={() => set('options', [...(field.options || []), 'Новый вариант'])}>
                <I.Plus size={11} />Добавить
              </button>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(field.options || []).map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 6 }}>
                  <input className="input" value={o} onChange={(e) => setOpt(i, e.target.value)} style={{ flex: 1 }} />
                  <button className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }}
                    onClick={() => set('options', field.options.filter((_, j) => j !== i))}>
                    <I.X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {field.type === 'calculated' && (
          <div>
            <label className="field-label">Формула</label>
            <input className="input" value={field.formula || ''} onChange={(e) => set('formula', e.target.value)}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
              placeholder="f4 / f5 * 1.09" />
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 6, lineHeight: 1.5 }}>
              Используйте id полей: <code style={{ background: 'var(--color-surface-2)', padding: '1px 5px', borderRadius: 3 }}>f4</code>, <code style={{ background: 'var(--color-surface-2)', padding: '1px 5px', borderRadius: 3 }}>f5</code>. <br />
              Поддерживаются: + − × ÷ ( ) , %
            </div>
            {allFieldRefs.length > 0 && (
              <div style={{ marginTop: 8, padding: 10, background: 'var(--color-surface-2)', borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: 'var(--color-text-3)', marginBottom: 4 }}>Доступные числовые поля:</div>
                {allFieldRefs.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-accent)' }}>{r.id}</code>
                    <span style={{ color: 'var(--color-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {field.type === 'file' && (
          <div>
            <label className="field-label">Допустимые форматы</label>
            <input className="input" value={field.accept || ''} onChange={(e) => set('accept', e.target.value)}
              placeholder=".pdf,.docx,.xlsx" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }} />
          </div>
        )}

        <div>
          <label className="field-label">Автозаполнение из eGov</label>
          <select className="select" value={field.autofill || ''} onChange={(e) => set('autofill', e.target.value)} style={{ appearance: 'none' }}>
            <option value="">Не заполнять</option>
            <option value="egov.iin">ИИН пользователя</option>
            <option value="egov.bin">БИН компании</option>
            <option value="egov.org_name">Название организации</option>
            <option value="egov.address">Юридический адрес</option>
            <option value="egov.phone">Телефон</option>
          </select>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
          <label className="field-label">Условие отображения</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 6 }}>
            <select className="select" defaultValue="" style={{ appearance: 'none' }}>
              <option value="">— Поле —</option>
              {allFieldRefs.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
            </select>
            <select className="select" defaultValue="=" style={{ appearance: 'none', textAlign: 'center' }}>
              <option>=</option><option>≠</option><option>{'>'}</option><option>{'<'}</option>
            </select>
            <input className="input" placeholder="Значение" />
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 6 }}>
            Поле появится только если условие выполнено
          </div>
        </div>

      </div>
    </aside>
  );
};

// ----- Preview drawer -----
const FBPreviewDrawer = ({ schema, onClose }) => {
  const [stepIdx, setStepIdx] = React.useState(0);
  const step = schema.steps[stepIdx];
  if (!step) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)' }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 540,
        background: 'var(--color-bg)', boxShadow: '-12px 0 40px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <I.Eye size={18} style={{ color: 'var(--color-accent)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Предпросмотр формы</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{schema.meta.title || 'Без названия'}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: 32, padding: 0 }}><I.X size={15} /></button>
        </div>

        {/* Stepper */}
        <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {schema.steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: i <= stepIdx ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: i <= stepIdx ? '#fff' : 'var(--color-text-3)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>{i + 1}</div>
                {i < schema.steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < stepIdx ? 'var(--color-primary)' : 'var(--color-border)' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 4 }}>{step.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 0, marginBottom: 24 }}>Шаг {stepIdx + 1} из {schema.steps.length}</p>

          {step.fields.map(f => (
            <div key={f.id} style={{ marginBottom: 18 }}>
              <label className="field-label">{f.label}{f.required && <span className="req">*</span>}</label>
              {f.type === 'textarea' ? (
                <textarea className="textarea" placeholder={f.placeholder} disabled />
              ) : f.type === 'select' ? (
                <select className="select" disabled style={{ appearance: 'none' }}>
                  <option>{f.placeholder || 'Выберите вариант'}</option>
                  {(f.options || []).map(o => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === 'radio' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(f.options || []).map((o, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 13 }}>
                      <input type="radio" name={f.id} disabled style={{ accentColor: 'var(--color-accent)' }} />
                      {o}
                    </label>
                  ))}
                </div>
              ) : f.type === 'checkbox' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input type="checkbox" disabled style={{ accentColor: 'var(--color-accent)' }} />
                  {f.placeholder || 'Согласен с условиями'}
                </label>
              ) : f.type === 'file' ? (
                <div style={{ padding: 18, border: '1.5px dashed var(--color-border-strong)', borderRadius: 8, textAlign: 'center', color: 'var(--color-text-3)', fontSize: 13 }}>
                  <I.Upload size={18} /><br />Перетащите файл или нажмите для выбора
                  {f.accept && <div style={{ fontSize: 11, marginTop: 4 }}>{f.accept}</div>}
                </div>
              ) : f.type === 'calculated' ? (
                <div style={{
                  padding: '10px 14px', background: 'var(--color-accent-soft)',
                  borderRadius: 6, fontSize: 14, color: 'var(--color-primary)',
                  fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <I.Sparkle size={14} />
                  Авто: {f.formula || '—'}
                </div>
              ) : f.type === 'currency' ? (
                <div style={{ position: 'relative' }}>
                  <input className="input" placeholder={f.placeholder || '0'} disabled
                    style={{ paddingRight: 32, fontFamily: 'JetBrains Mono, monospace' }} />
                  <span style={{ position: 'absolute', right: 12, top: 9, color: 'var(--color-text-3)' }}>{f.currency || '₸'}</span>
                </div>
              ) : (
                <input className="input" type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  placeholder={f.placeholder} disabled />
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" disabled={stepIdx === 0} onClick={() => setStepIdx(i => i - 1)}>
            <I.ArrowLeft size={14} />Назад
          </button>
          {stepIdx < schema.steps.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStepIdx(i => i + 1)}>Далее <I.ArrowRight size={14} /></button>
          ) : (
            <button className="btn btn-primary" disabled>Отправить заявку <I.Check size={14} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== Main page =====

const FormBuilderPage = ({ go, serviceId }) => {
  const [schema, setSchema] = React.useState(DEFAULT_SCHEMA);
  const [selectedFieldId, setSelectedFieldId] = React.useState(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [saving, setSaving] = React.useState(null);
  const toast = useToast();

  const isEdit = !!serviceId;

  // Find selected field across all steps
  const findFieldRef = () => {
    for (const s of schema.steps) {
      const f = s.fields.find(x => x.id === selectedFieldId);
      if (f) return { step: s, field: f };
    }
    return null;
  };
  const selectedRef = findFieldRef();

  // All fields available for refs/conditions
  const allFieldRefs = schema.steps.flatMap(s => s.fields.map(f => ({ id: f.id, label: f.label, type: f.type })))
    .filter(f => f.id !== selectedFieldId);

  // ----- mutations -----
  const updateField = (newField) => {
    setSchema(s => ({
      ...s,
      steps: s.steps.map(st => ({
        ...st,
        fields: st.fields.map(f => f.id === newField.id ? newField : f),
      })),
    }));
  };
  const moveField = (stepIdx, fieldIdx, dir) => {
    setSchema(s => {
      const steps = [...s.steps];
      const fields = [...steps[stepIdx].fields];
      const target = fieldIdx + dir;
      if (target < 0 || target >= fields.length) return s;
      [fields[fieldIdx], fields[target]] = [fields[target], fields[fieldIdx]];
      steps[stepIdx] = { ...steps[stepIdx], fields };
      return { ...s, steps };
    });
  };
  const deleteField = (stepIdx, fieldIdx) => {
    setSchema(s => {
      const steps = [...s.steps];
      const fields = steps[stepIdx].fields.filter((_, i) => i !== fieldIdx);
      steps[stepIdx] = { ...steps[stepIdx], fields };
      return { ...s, steps };
    });
    if (selectedRef && selectedRef.step.fields[fieldIdx] && selectedRef.step.fields[fieldIdx].id === selectedFieldId) {
      setSelectedFieldId(null);
    }
  };
  const addField = (stepIdx, field) => {
    setSchema(s => {
      const steps = [...s.steps];
      steps[stepIdx] = { ...steps[stepIdx], fields: [...steps[stepIdx].fields, field] };
      return { ...s, steps };
    });
    setSelectedFieldId(field.id);
  };
  const updateStep = (i, newStep) => setSchema(s => {
    const steps = [...s.steps]; steps[i] = newStep; return { ...s, steps };
  });
  const removeStep = (i) => setSchema(s => ({ ...s, steps: s.steps.filter((_, j) => j !== i) }));
  const moveStep = (i, dir) => setSchema(s => {
    const steps = [...s.steps];
    const target = i + dir; if (target < 0 || target >= steps.length) return s;
    [steps[i], steps[target]] = [steps[target], steps[i]];
    return { ...s, steps };
  });
  const addStep = () => setSchema(s => ({
    ...s, steps: [...s.steps, { id: 'step_' + Math.random().toString(36).slice(2, 6), title: 'Новый этап', condition: null, fields: [] }]
  }));

  const applyAi = (aiSchema) => {
    setSchema(s => ({ ...s, steps: aiSchema.steps }));
    setSelectedFieldId(null);
  };

  const onSave = (kind) => {
    setSaving(kind);
    setTimeout(() => {
      setSaving(null);
      toast.push(kind === 'publish' ? 'Услуга опубликована' : 'Черновик сохранён', 'success');
      if (kind === 'publish') go('admin');
    }, 900);
  };

  return (
    <div className="page-fade" style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--color-bg)' }}>

      <FBLeftPanel schema={schema} setSchema={setSchema}
        onPublish={() => onSave('publish')} onSaveDraft={() => onSave('draft')} saving={saving} />

      {/* Center canvas */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 32px',
          background: '#fff', borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0, zIndex: 5,
        }}>
          <button className="btn btn-ghost btn-sm" onClick={() => go('admin')}>
            <I.ArrowLeft size={14} />Назад к услугам
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              {isEdit ? `Редактирование · ID #${serviceId}` : 'Новая услуга'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{schema.meta.title || 'Без названия'}</div>
          </div>
          <span className="badge badge-amber"><span style={{ width: 6, height: 6, background: 'var(--color-warning)', borderRadius: '50%' }} />Черновик</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPreview(true)}>
            <I.Eye size={14} />Предпросмотр
          </button>
        </div>

        <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 32px 60px' }}>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 6 }}>Холст формы</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Структура заявки</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4, marginBottom: 0 }}>
              {schema.steps.length} этапов · {schema.steps.reduce((n, s) => n + s.fields.length, 0)} полей · последнее изменение только что
            </p>
          </div>

          <FBAiBlock onApply={applyAi} />

          {schema.steps.map((step, i) => (
            <FBStep key={step.id} step={step} idx={i} total={schema.steps.length}
              selectedId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onUpdateStep={(s) => updateStep(i, s)}
              onRemoveStep={() => removeStep(i)}
              onMoveStep={(d) => moveStep(i, d)}
              onAddField={(f) => addField(i, f)}
              onMoveField={(fi, d) => moveField(i, fi, d)}
              onDeleteField={(fi) => deleteField(i, fi)}
            />
          ))}

          <button onClick={addStep} style={{
            width: '100%', height: 56, marginTop: 8,
            background: '#fff', border: '1.5px dashed var(--color-border-strong)',
            borderRadius: 12, color: 'var(--color-text-2)',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 120ms',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-2)'; }}
          >
            <I.Plus size={16} />Добавить этап
          </button>
        </div>
      </main>

      <FBRightPanel
        field={selectedRef?.field}
        allFieldRefs={allFieldRefs}
        onChange={updateField}
        onClose={() => setSelectedFieldId(null)}
      />

      {showPreview && <FBPreviewDrawer schema={schema} onClose={() => setShowPreview(false)} />}
    </div>
  );
};

window.FormBuilderPage = FormBuilderPage;
