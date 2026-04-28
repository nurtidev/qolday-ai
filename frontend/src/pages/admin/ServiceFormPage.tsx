import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { servicesApi, aiApi } from '@/api/client'
import { I } from '@/components/icons'
import { useToast } from '@/components/Toast'
import type { FormField, FormStep, FieldType, Service, FormFieldCondition } from '@/types'

// ─── constants ────────────────────────────────────────────────────────────────

type BuilderFieldType = FieldType

const FIELD_TYPE_META: { id: BuilderFieldType; label: string; iconKey: keyof typeof I; desc: string }[] = [
  { id: 'text',       label: 'Текст',              iconKey: 'Document',    desc: 'Однострочное поле' },
  { id: 'textarea',   label: 'Длинный текст',      iconKey: 'Document',    desc: 'Многострочное поле' },
  { id: 'number',     label: 'Число',              iconKey: 'Hash',        desc: 'Числовое значение' },
  { id: 'currency',   label: 'Сумма (₸)',          iconKey: 'Coins',       desc: 'Числовое с маской валюты' },
  { id: 'select',     label: 'Выпадающий список',  iconKey: 'List',        desc: 'Выбор одного из…' },
  { id: 'radio',      label: 'Переключатели',      iconKey: 'CheckCircle', desc: 'Один из вариантов' },
  { id: 'checkbox',   label: 'Чекбокс',            iconKey: 'Check',       desc: 'Да / нет' },
  { id: 'date',       label: 'Дата',               iconKey: 'Calendar',    desc: 'Календарь' },
  { id: 'file',       label: 'Файл',               iconKey: 'Upload',      desc: 'Загрузка документов' },
  { id: 'calculated', label: 'Вычисляемое',        iconKey: 'Sparkle',     desc: 'Формула из других полей' },
]

const FIELD_BY_ID = Object.fromEntries(FIELD_TYPE_META.map(t => [t.id, t]))

const CATEGORIES = ['Кредитование', 'Гарантии', 'Лизинг', 'Экспорт', 'Инвестиции', 'Гранты', 'Страхование']
const ORGS = ['БРК', 'КазАгро', 'КМС', 'KAZAKH INVEST', 'KAZNEX INVEST', 'DAMU', 'Байтерек Девелопмент']

const OP_LABELS: Record<FormFieldCondition['operator'], string> = {
  equals:       'равно',
  not_equals:   'не равно',
  greater_than: 'больше чем',
  less_than:    'меньше чем',
}

const EGOV_OPTS = [
  { value: '',                label: 'Не заполнять' },
  { value: 'egov.iin',        label: 'ИИН пользователя' },
  { value: 'egov.bin',        label: 'БИН компании' },
  { value: 'egov.org_name',   label: 'Название организации' },
  { value: 'egov.address',    label: 'Юридический адрес' },
  { value: 'egov.phone',      label: 'Телефон' },
]

interface BuilderField extends Omit<FormField, 'type'> {
  type: BuilderFieldType
}

interface BuilderStep {
  id: string
  title: string
  fields: BuilderField[]
  condition?: FormStep['condition']
}

interface BuilderMeta {
  title: string
  category: string
  org_name: string
  description: string
}

const DEFAULT_META: BuilderMeta = { title: '', category: '', org_name: '', description: '' }

const DEFAULT_STEPS: BuilderStep[] = [
  {
    id: 'step_1',
    title: 'Информация о компании',
    fields: [
      { id: 'f1', type: 'text',     label: 'Наименование организации', placeholder: 'ТОО «…»',  required: true,  prefill_from: 'egov.org_name' },
      { id: 'f2', type: 'text',     label: 'БИН',                      placeholder: '12 цифр',  required: true,  prefill_from: 'egov.bin' },
      { id: 'f3', type: 'select',   label: 'Размер бизнеса',            required: true,           options: ['Микробизнес', 'МСБ', 'Крупный бизнес'] },
    ],
  },
]

// ─── LeftPanel ─────────────────────────────────────────────────────────────────

function LeftPanel({ meta, setMeta, onSaveDraft, onPublish, saving }: {
  meta: BuilderMeta
  setMeta: (m: BuilderMeta) => void
  onSaveDraft: () => void
  onPublish: () => void
  saving: 'draft' | 'publish' | null
}) {
  const set = (k: keyof BuilderMeta, v: string) => setMeta({ ...meta, [k]: v })

  return (
    <aside style={{
      width: 280, flexShrink: 0, borderRight: '1px solid var(--color-border)',
      background: '#fff', padding: '24px 20px', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 4 }}>
          Настройки услуги
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Отображается в каталоге</div>
      </div>

      <div>
        <label className="field-label">Название<span className="req">*</span></label>
        <input className="input" placeholder="Льготный кредит для МСБ" value={meta.title} onChange={e => set('title', e.target.value)} />
      </div>

      <div>
        <label className="field-label">Категория<span className="req">*</span></label>
        <div style={{ position: 'relative' }}>
          <select className="select" value={meta.category} onChange={e => set('category', e.target.value)} style={{ appearance: 'none', paddingRight: 32 }}>
            <option value="">Выберите</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <I.ChevronDown size={14} style={{ position: 'absolute', right: 10, top: 10, color: 'var(--color-text-3)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div>
        <label className="field-label">Организация<span className="req">*</span></label>
        <div style={{ position: 'relative' }}>
          <select className="select" value={meta.org_name} onChange={e => set('org_name', e.target.value)} style={{ appearance: 'none', paddingRight: 32 }}>
            <option value="">Выберите</option>
            {ORGS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <I.ChevronDown size={14} style={{ position: 'absolute', right: 10, top: 10, color: 'var(--color-text-3)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div>
        <label className="field-label">Описание</label>
        <textarea className="textarea" placeholder="2–3 предложения о программе" value={meta.description} onChange={e => set('description', e.target.value)} style={{ minHeight: 90 }} />
      </div>

      <div style={{ padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.5 }}>
        <I.Info size={13} style={{ float: 'left', marginRight: 6, color: 'var(--color-accent)', marginTop: 1 }} />
        Заявки по этой услуге автоматически направятся в раздел <strong style={{ color: 'var(--color-text-2)' }}>Заявки</strong>.
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
        <button className="btn btn-primary btn-block" onClick={onPublish} disabled={saving === 'publish'}>
          {saving === 'publish'
            ? <><Spinner /> Публикация…</>
            : <><I.Check size={15} /> Опубликовать</>}
        </button>
        <button className="btn btn-secondary btn-block" onClick={onSaveDraft} disabled={saving === 'draft'}>
          {saving === 'draft' ? <><Spinner dark /> Сохранение…</> : 'Сохранить черновик'}
        </button>
      </div>
    </aside>
  )
}

// ─── AiBlock ──────────────────────────────────────────────────────────────────

function AiBlock({ onApply }: { onApply: (steps: BuilderStep[]) => void }) {
  const [prompt, setPrompt] = useState('Льготный кредит для микробизнеса под залог сельхозтехники, до 50 млн тенге, срок до 5 лет')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [generated, setGenerated] = useState<BuilderStep[] | null>(null)
  const toast = useToast()

  const generate = async () => {
    if (!prompt.trim()) { toast.push('Опишите услугу', 'error'); return }
    setState('loading')
    setProgress(0)

    const tick = setInterval(() => setProgress(p => Math.min(p + 7, 92)), 220)

    try {
      const res = await aiApi.generateForm(prompt)
      clearInterval(tick)
      setProgress(100)

      const schema = res.data.form_schema as {
        steps: {
          id?: string; title: string
          fields: { id?: string; type?: string; label: string; required?: boolean; options?: string[]; formula?: string; placeholder?: string; accept?: string; prefill_from?: string }[]
        }[]
      }
      if (!schema?.steps) throw new Error('Invalid schema')

      const steps: BuilderStep[] = schema.steps.map((s, i) => ({
        id: s.id || `s${i + 1}_ai`,
        title: s.title || `Этап ${i + 1}`,
        fields: (s.fields || []).map((f, j) => ({
          id: f.id || `f${i + 1}_${j + 1}_ai`,
          type: (f.type as BuilderFieldType) || 'text',
          label: f.label || 'Поле',
          required: !!f.required,
          options: f.options,
          formula: f.formula,
          placeholder: f.placeholder,
          accept: f.accept,
          prefill_from: f.prefill_from,
        })),
      }))

      setGenerated(steps)
      setState('success')
      toast.push('Форма сгенерирована', 'success')
    } catch {
      clearInterval(tick)
      setState('error')
      toast.push('Ошибка генерации. Попробуйте ещё раз', 'error')
    }
  }

  if (state === 'success' && generated) {
    const total = generated.reduce((n, s) => n + s.fields.length, 0)
    return (
      <div style={{ background: 'linear-gradient(135deg,#EEF2FF 0%,#DBEAFE 100%)', border: '1px solid #C7D2FE', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <I.CheckCircle size={15} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Готово · {generated.length} этап(ов), {total} полей</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 14 }}>
          Claude сгенерировал черновик формы. Проверьте поля и примените к холсту — заменит текущие этапы.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => { onApply(generated); setState('idle'); setGenerated(null) }}>
            <I.Check size={14} /> Применить к холсту
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setState('idle'); setGenerated(null) }}>Отменить</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm" onClick={generate}><I.Sparkle size={14} /> Пересоздать</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#3B82F6 100%)', borderRadius: 12, padding: 20, marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <I.Sparkle size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>AI-конструктор формы</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Опишите услугу — Claude сгенерирует структуру</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 10, padding: '3px 8px', background: 'rgba(255,255,255,0.18)', borderRadius: 999, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Claude Sonnet 4.6
          </span>
        </div>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Например: льготный кредит для МСБ под 9% годовых, сумма до 100 млн тенге…"
          disabled={state === 'loading'}
          style={{
            width: '100%', minHeight: 76, marginTop: 2,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8, padding: '10px 14px', color: '#fff', fontFamily: 'inherit',
            fontSize: 14, lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          }}
        />

        {state === 'loading' && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>Claude анализирует описание…</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#fff', transition: 'width 220ms ease' }} />
            </div>
          </div>
        )}

        {state !== 'loading' && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={generate} style={{
              height: 38, padding: '0 18px', borderRadius: 8, border: 'none',
              background: '#fff', color: 'var(--color-primary)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <I.Sparkle size={15} /> Сгенерировать форму через AI
            </button>
            {state === 'error' && (
              <span style={{ fontSize: 12, color: '#FCA5A5', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <I.Alert size={13} /> Ошибка генерации
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

function FieldRow({ field, selected, onSelect, onMove, onDelete, canUp, canDown }: {
  field: BuilderField
  selected: boolean
  onSelect: () => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
  canUp: boolean
  canDown: boolean
}) {
  const meta = FIELD_BY_ID[field.type] || FIELD_BY_ID.text
  const IconComp = I[meta.iconKey] as (p: { size: number }) => JSX.Element
  const isCalc = field.type === 'calculated'

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
        background: selected ? 'var(--color-accent-soft)' : '#fff',
        border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: 8, cursor: 'pointer', marginBottom: 8, transition: 'all 120ms',
        boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
      }}
    >
      <I.GripVertical size={14} style={{ color: 'var(--color-text-4)', flexShrink: 0 }} />

      <div style={{
        width: 30, height: 30, borderRadius: 6, flexShrink: 0,
        background: isCalc ? 'rgba(59,130,246,0.12)' : 'var(--color-surface-2)',
        color: isCalc ? 'var(--color-accent)' : 'var(--color-text-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconComp size={14} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, color: isCalc ? 'var(--color-accent)' : 'var(--color-text)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {field.label || <em style={{ color: 'var(--color-text-4)' }}>Без названия</em>}
          </span>
          {field.required && <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>*</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-3)', display: 'flex', gap: 6, marginTop: 2 }}>
          <span>{meta.label}</span>
          {field.prefill_from && <><span>·</span><span style={{ color: 'var(--color-accent)' }}>eGov: {field.prefill_from.split('.')[1]}</span></>}
          {field.formula && <><span>·</span><span style={{ fontFamily: 'monospace', color: 'var(--color-accent)', fontSize: 11 }}>= {field.formula}</span></>}
          {field.options && <><span>·</span><span>{field.options.length} опций</span></>}
        </div>
      </div>

      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 2 }}>
        <button className="btn btn-ghost btn-sm" disabled={!canUp}   onClick={() => onMove(-1)} style={{ width: 28, padding: 0 }}><I.ChevronUp   size={14} /></button>
        <button className="btn btn-ghost btn-sm" disabled={!canDown} onClick={() => onMove(1)}  style={{ width: 28, padding: 0 }}><I.ChevronDown size={14} /></button>
        <button className="btn btn-ghost btn-sm" onClick={onDelete} style={{ width: 28, padding: 0, color: 'var(--color-text-3)' }}><I.Trash size={14} /></button>
      </div>
    </div>
  )
}

// ─── AddFieldMenu ─────────────────────────────────────────────────────────────

function AddFieldMenu({ onPick, onClose }: { onPick: (type: BuilderFieldType) => void; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(15,23,42,0.3)' }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 520, background: '#fff', borderRadius: 12, boxShadow: 'var(--sh-lg)', padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Выберите тип поля</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: 28, padding: 0 }}><I.X size={14} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {FIELD_TYPE_META.map(t => {
            const IconComp = I[t.iconKey] as (p: { size: number }) => JSX.Element
            const isCalc = t.id === 'calculated'
            return (
              <button key={t.id} onClick={() => onPick(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: '#fff', border: '1px solid var(--color-border)', borderRadius: 8,
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: isCalc ? 'rgba(59,130,246,0.12)' : 'var(--color-surface-2)',
                  color: isCalc ? 'var(--color-accent)' : 'var(--color-text-2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconComp size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{t.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── ConditionModal ───────────────────────────────────────────────────────────

function ConditionModal({ condition, availableFields, onSave, onClear, onClose }: {
  condition?: FormFieldCondition
  availableFields: BuilderField[]
  onSave: (c: FormFieldCondition) => void
  onClear: () => void
  onClose: () => void
}) {
  const [fieldId, setFieldId]   = useState(condition?.field_id || '')
  const [operator, setOperator] = useState<FormFieldCondition['operator']>(condition?.operator || 'equals')
  const [value, setValue]       = useState(String(condition?.value ?? ''))

  const selectedField = availableFields.find(f => f.id === fieldId)

  const OPERATORS: { id: FormFieldCondition['operator']; label: string }[] = [
    { id: 'equals',       label: 'равно (=)' },
    { id: 'not_equals',   label: 'не равно (≠)' },
    { id: 'greater_than', label: 'больше (>)' },
    { id: 'less_than',    label: 'меньше (<)' },
  ]

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, background: '#fff', borderRadius: 12, boxShadow: 'var(--sh-lg)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Условие показа этапа</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>Этап отображается только при выполнении условия</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: 28, padding: 0 }}><I.X size={14} /></button>
        </div>

        {availableFields.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-3)', fontSize: 13 }}>
            Нет доступных полей. Сначала добавьте поля в предыдущие этапы.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="field-label">Поле</label>
              <div style={{ position: 'relative' }}>
                <select className="select" value={fieldId} onChange={e => { setFieldId(e.target.value); setValue('') }} style={{ appearance: 'none', paddingRight: 32 }}>
                  <option value="">Выберите поле</option>
                  {availableFields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
                <I.ChevronDown size={14} style={{ position: 'absolute', right: 10, top: 10, color: 'var(--color-text-3)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label className="field-label">Оператор</label>
              <div style={{ position: 'relative' }}>
                <select className="select" value={operator} onChange={e => setOperator(e.target.value as FormFieldCondition['operator'])} style={{ appearance: 'none', paddingRight: 32 }}>
                  {OPERATORS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <I.ChevronDown size={14} style={{ position: 'absolute', right: 10, top: 10, color: 'var(--color-text-3)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label className="field-label">Значение</label>
              {selectedField?.options && selectedField.options.length > 0 ? (
                <div style={{ position: 'relative' }}>
                  <select className="select" value={value} onChange={e => setValue(e.target.value)} style={{ appearance: 'none', paddingRight: 32 }}>
                    <option value="">Выберите значение</option>
                    {selectedField.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <I.ChevronDown size={14} style={{ position: 'absolute', right: 10, top: 10, color: 'var(--color-text-3)', pointerEvents: 'none' }} />
                </div>
              ) : (
                <input className="input" value={value} onChange={e => setValue(e.target.value)} placeholder="Введите значение" />
              )}
            </div>

            {fieldId && value && (
              <div style={{ padding: '10px 14px', background: '#FFFBEB', border: '1px dashed #FCD34D', borderRadius: 8, fontSize: 13, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <I.Filter size={13} />
                <span>
                  Показывается если{' '}
                  <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace', fontSize: 12 }}>
                    {availableFields.find(f => f.id === fieldId)?.label || fieldId}
                  </code>{' '}
                  {OP_LABELS[operator]}{' '}
                  <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace', fontSize: 12 }}>«{value}»</code>
                </span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-primary" onClick={() => { if (fieldId && value.trim()) onSave({ field_id: fieldId, operator, value }) }} disabled={!fieldId || !value.trim()} style={{ flex: 1 }}>
            <I.Check size={14} /> Применить
          </button>
          {condition && (
            <button className="btn btn-secondary" onClick={onClear}>Убрать условие</button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  )
}

// ─── StepBlock ────────────────────────────────────────────────────────────────

function StepBlock({ step, idx, total, selectedFieldId, onSelectField, onUpdateStep, onRemoveStep, onMoveStep, onAddField, onMoveField, onDeleteField, allPrevFields }: {
  step: BuilderStep
  idx: number
  total: number
  selectedFieldId: string | null
  onSelectField: (id: string) => void
  onUpdateStep: (s: BuilderStep) => void
  onRemoveStep: () => void
  onMoveStep: (dir: -1 | 1) => void
  onAddField: (f: BuilderField) => void
  onMoveField: (fi: number, dir: -1 | 1) => void
  onDeleteField: (fi: number) => void
  allPrevFields: BuilderField[]
}) {
  const [editTitle, setEditTitle] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showCondition, setShowCondition] = useState(false)

  const addField = (type: BuilderFieldType) => {
    const meta = FIELD_BY_ID[type]
    onAddField({
      id: 'f_' + Math.random().toString(36).slice(2, 7),
      type,
      label: 'Новое поле (' + meta.label.toLowerCase() + ')',
      required: false,
      ...(type === 'select' || type === 'radio' ? { options: ['Вариант 1', 'Вариант 2'] } : {}),
      ...(type === 'calculated' ? { formula: '' } : {}),
    })
    setShowAdd(false)
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Condition banner — only for non-first steps */}
      {idx > 0 && (
        <div style={{ marginBottom: 8 }}>
          {step.condition ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FFFBEB', border: '1px dashed #FCD34D', borderRadius: 8, fontSize: 13, color: '#92400E' }}>
              <I.Filter size={13} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>
                Показывается если{' '}
                <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace', fontSize: 12 }}>
                  {allPrevFields.find(f => f.id === step.condition!.field_id)?.label || step.condition.field_id}
                </code>{' '}
                {OP_LABELS[step.condition.operator]}{' '}
                <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace', fontSize: 12 }}>«{step.condition.value}»</code>
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCondition(true)} style={{ fontSize: 12, color: '#92400E', padding: '2px 8px' }}>Изменить</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStep({ ...step, condition: undefined })} style={{ width: 24, padding: 0, color: '#92400E' }}><I.X size={12} /></button>
            </div>
          ) : (
            <button onClick={() => setShowCondition(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'transparent', border: '1px dashed var(--color-border)', borderRadius: 8, color: 'var(--color-text-3)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
              <I.Filter size={12} /> Добавить условие показа
            </button>
          )}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, boxShadow: 'var(--sh-xs)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)',
            color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, flexShrink: 0,
          }}>{idx + 1}</div>

          {editTitle ? (
            <input
              autoFocus className="input"
              value={step.title}
              onChange={e => onUpdateStep({ ...step, title: e.target.value })}
              onBlur={() => setEditTitle(false)}
              onKeyDown={e => { if (e.key === 'Enter') setEditTitle(false) }}
              style={{ flex: 1, fontSize: 15, fontWeight: 600, height: 34 }}
            />
          ) : (
            <h3
              onClick={() => setEditTitle(true)}
              title="Нажмите, чтобы переименовать"
              style={{ flex: 1, fontSize: 15, fontWeight: 600, margin: 0, cursor: 'text', padding: '4px 6px', borderRadius: 6 }}
            >
              Этап {idx + 1}: {step.title}
            </h3>
          )}

          <span style={{ fontSize: 12, color: 'var(--color-text-3)', padding: '2px 8px', background: 'var(--color-surface-2)', borderRadius: 999, flexShrink: 0 }}>
            {step.fields.length} {step.fields.length === 1 ? 'поле' : 'полей'}
          </span>

          <div style={{ display: 'flex', gap: 2 }}>
            <button className="btn btn-ghost btn-sm" disabled={idx === 0}          onClick={() => onMoveStep(-1)} style={{ width: 28, padding: 0 }}><I.ChevronUp   size={14} /></button>
            <button className="btn btn-ghost btn-sm" disabled={idx === total - 1}  onClick={() => onMoveStep(1)}  style={{ width: 28, padding: 0 }}><I.ChevronDown size={14} /></button>
            <button className="btn btn-ghost btn-sm" onClick={onRemoveStep} style={{ width: 28, padding: 0, color: 'var(--color-text-3)' }}><I.Trash size={14} /></button>
          </div>
        </div>

        {step.fields.length === 0 && (
          <div style={{ padding: 28, textAlign: 'center', borderRadius: 8, border: '2px dashed var(--color-border)', color: 'var(--color-text-3)', fontSize: 13, marginBottom: 8 }}>
            На этом этапе пока нет полей
          </div>
        )}

        {step.fields.map((f, i) => (
          <FieldRow
            key={f.id} field={f}
            selected={selectedFieldId === f.id}
            onSelect={() => onSelectField(f.id)}
            onMove={dir => onMoveField(i, dir)}
            onDelete={() => onDeleteField(i)}
            canUp={i > 0} canDown={i < step.fields.length - 1}
          />
        ))}

        <button
          onClick={() => setShowAdd(true)}
          style={{
            width: '100%', height: 38, marginTop: 4,
            background: 'transparent', border: '1.5px dashed var(--color-border-strong)',
            borderRadius: 8, color: 'var(--color-text-2)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <I.Plus size={14} /> Добавить поле
        </button>
      </div>

      {showAdd && <AddFieldMenu onPick={addField} onClose={() => setShowAdd(false)} />}
      {showCondition && (
        <ConditionModal
          condition={step.condition}
          availableFields={allPrevFields}
          onSave={c => { onUpdateStep({ ...step, condition: c }); setShowCondition(false) }}
          onClear={() => { onUpdateStep({ ...step, condition: undefined }); setShowCondition(false) }}
          onClose={() => setShowCondition(false)}
        />
      )}
    </div>
  )
}

// ─── RightPanel ───────────────────────────────────────────────────────────────

function RightPanel({ field, allFields, onChange, onClose }: {
  field: BuilderField | null
  allFields: BuilderField[]
  onChange: (f: BuilderField) => void
  onClose: () => void
}) {
  if (!field) {
    return (
      <aside style={{ width: 300, flexShrink: 0, borderLeft: '1px solid var(--color-border)', background: '#fff', padding: '40px 20px', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-3)', marginTop: 60 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <I.Sliders size={20} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-2)', marginBottom: 6 }}>Настройки поля</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>Кликните на поле в холсте, чтобы изменить его свойства</div>
        </div>
      </aside>
    )
  }

  const set = (k: keyof BuilderField, v: unknown) => onChange({ ...field, [k]: v })
  const setOpt = (i: number, v: string) => set('options', (field.options || []).map((x, j) => j === i ? v : x))
  const meta = FIELD_BY_ID[field.type] || FIELD_BY_ID.text
  const IconComp = I[meta.iconKey] as (p: { size: number }) => JSX.Element
  const numericFields = allFields.filter(f => ['number', 'currency', 'calculated'].includes(f.type) && f.id !== field.id)

  return (
    <aside style={{ width: 300, flexShrink: 0, borderLeft: '1px solid var(--color-border)', background: '#fff', overflowY: 'auto' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--color-accent-soft)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconComp size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Настройки поля</div>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.label || '—'}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: 28, padding: 0 }}><I.X size={14} /></button>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="field-label">Заголовок</label>
          <input className="input" value={field.label || ''} onChange={e => set('label', e.target.value)} />
        </div>

        <div>
          <label className="field-label">Тип поля</label>
          <div style={{ position: 'relative' }}>
            <select className="select" value={field.type} onChange={e => set('type', e.target.value as BuilderFieldType)} style={{ appearance: 'none', paddingRight: 32 }}>
              {FIELD_TYPE_META.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <I.ChevronDown size={14} style={{ position: 'absolute', right: 10, top: 10, color: 'var(--color-text-3)', pointerEvents: 'none' }} />
          </div>
        </div>

        {!['file', 'calculated', 'checkbox'].includes(field.type) && (
          <div>
            <label className="field-label">Подсказка (placeholder)</label>
            <input className="input" value={field.placeholder || ''} onChange={e => set('placeholder', e.target.value)} placeholder="Например: введите ИИН" />
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Обязательное поле</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Нельзя пропустить этап</div>
          </div>
          <span
            onClick={() => set('required', !field.required)}
            style={{
              width: 36, height: 20, borderRadius: 999, position: 'relative', cursor: 'pointer', display: 'block', flexShrink: 0,
              background: field.required ? 'var(--color-success)' : 'var(--color-border-strong)',
              transition: 'background 120ms',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: field.required ? 18 : 2,
              width: 16, height: 16, background: '#fff', borderRadius: '50%',
              transition: 'left 120ms',
            }} />
          </span>
        </label>

        {(field.type === 'select' || field.type === 'radio') && (
          <div>
            <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Варианты</span>
              <button className="btn btn-ghost btn-sm" style={{ height: 22, fontSize: 12, padding: '0 6px' }}
                onClick={() => set('options', [...(field.options || []), 'Новый вариант'])}>
                <I.Plus size={11} /> Добавить
              </button>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(field.options || []).map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 6 }}>
                  <input className="input" value={o} onChange={e => setOpt(i, e.target.value)} style={{ flex: 1 }} />
                  <button className="btn btn-ghost btn-sm" style={{ width: 30, padding: 0 }}
                    onClick={() => set('options', (field.options || []).filter((_, j) => j !== i))}>
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
            <input className="input" value={field.formula || ''} onChange={e => set('formula', e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: 13 }} placeholder="f4 / f5 * 1.09" />
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 6, lineHeight: 1.5 }}>
              Используйте id полей: <code style={{ background: 'var(--color-surface-2)', padding: '1px 5px', borderRadius: 3 }}>f4</code>.
              Поддерживаются: + − × ÷ ( )
            </div>
            {numericFields.length > 0 && (
              <div style={{ marginTop: 8, padding: 10, background: 'var(--color-surface-2)', borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: 'var(--color-text-3)', marginBottom: 4 }}>Числовые поля:</div>
                {numericFields.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <code style={{ color: 'var(--color-accent)', fontFamily: 'monospace' }}>{r.id}</code>
                    <span style={{ color: 'var(--color-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {field.type === 'file' && (
          <div>
            <label className="field-label">Допустимые форматы</label>
            <input className="input" value={field.accept || ''} onChange={e => set('accept', e.target.value)}
              placeholder=".pdf,.docx,.xlsx" style={{ fontFamily: 'monospace', fontSize: 13 }} />
          </div>
        )}

        <div>
          <label className="field-label">Автозаполнение из eGov</label>
          <div style={{ position: 'relative' }}>
            <select className="select" value={field.prefill_from || ''} onChange={e => set('prefill_from', e.target.value || undefined)} style={{ appearance: 'none', paddingRight: 32 }}>
              {EGOV_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <I.ChevronDown size={14} style={{ position: 'absolute', right: 10, top: 10, color: 'var(--color-text-3)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── PreviewDrawer ────────────────────────────────────────────────────────────

function PreviewDrawer({ steps, title, onClose }: { steps: BuilderStep[]; title: string; onClose: () => void }) {
  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]
  if (!step) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)' }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 520,
        background: 'var(--color-bg)', boxShadow: '-12px 0 40px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '14px 24px', background: '#fff', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <I.Eye size={18} style={{ color: 'var(--color-accent)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Предпросмотр</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{title || 'Без названия'}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ width: 32, padding: 0 }}><I.X size={15} /></button>
        </div>

        <div style={{ padding: '14px 24px', background: '#fff', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {steps.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < steps.length - 1 ? 1 : undefined }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: i <= stepIdx ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: i <= stepIdx ? '#fff' : 'var(--color-text-3)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>{i + 1}</div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < stepIdx ? 'var(--color-primary)' : 'var(--color-border)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 4 }}>{step.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 0, marginBottom: 24 }}>Шаг {stepIdx + 1} из {steps.length}</p>

          {step.fields.map(f => (
            <div key={f.id} style={{ marginBottom: 18 }}>
              <label className="field-label">{f.label}{f.required && <span className="req">*</span>}</label>
              {f.type === 'textarea' ? (
                <textarea className="textarea" placeholder={f.placeholder} disabled rows={3} />
              ) : f.type === 'select' ? (
                <select className="select" disabled style={{ appearance: 'none' }}>
                  <option>{f.placeholder || 'Выберите вариант'}</option>
                  {(f.options || []).map(o => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === 'radio' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(f.options || []).map((o, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 13 }}>
                      <input type="radio" disabled style={{ accentColor: 'var(--color-accent)' }} /> {o}
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
                <div style={{ padding: '10px 14px', background: 'var(--color-accent-soft)', borderRadius: 6, fontSize: 14, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <I.Sparkle size={14} /> Авто: {f.formula || '—'}
                </div>
              ) : f.type === 'currency' ? (
                <div style={{ position: 'relative' }}>
                  <input className="input" placeholder={f.placeholder || '0'} disabled style={{ paddingRight: 32, fontFamily: 'monospace' }} />
                  <span style={{ position: 'absolute', right: 12, top: 9, color: 'var(--color-text-3)', fontSize: 13 }}>₸</span>
                </div>
              ) : (
                <input className="input" type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} placeholder={f.placeholder} disabled />
              )}
              {f.prefill_from && (
                <div style={{ fontSize: 11, color: 'var(--color-accent)', marginTop: 4 }}>
                  Автозаполнение: {EGOV_OPTS.find(o => o.value === f.prefill_from)?.label || f.prefill_from}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 24px', background: '#fff', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" disabled={stepIdx === 0} onClick={() => setStepIdx(i => i - 1)}>
            <I.ArrowLeft size={14} /> Назад
          </button>
          {stepIdx < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStepIdx(i => i + 1)}>Далее <I.ArrowRight size={14} /></button>
          ) : (
            <button className="btn btn-primary" disabled>Подать заявку <I.Check size={14} /></button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Spinner helper ───────────────────────────────────────────────────────────

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: '50%',
      border: `2px solid ${dark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)'}`,
      borderTopColor: dark ? 'var(--color-text-2)' : '#fff',
      animation: 'spin 700ms linear infinite', display: 'inline-block',
    }} />
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ServiceFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [meta, setMeta] = useState<BuilderMeta>(DEFAULT_META)
  const [steps, setSteps] = useState<BuilderStep[]>(DEFAULT_STEPS)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null)
  const [initialized, setInitialized] = useState(false)

  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ['service', id],
    queryFn: () => servicesApi.get(id!).then(r => r.data),
    enabled: !!id,
  })

  useEffect(() => {
    if (!service || initialized) return
    setMeta({
      title:       service.title,
      category:    service.category    || '',
      org_name:    service.org_name    || '',
      description: service.description || '',
    })
    if (service.form_schema?.steps?.length) {
      setSteps(service.form_schema.steps as BuilderStep[])
    }
    setInitialized(true)
  }, [service, initialized])

  const selectedField = selectedFieldId
    ? steps.flatMap(s => s.fields).find(f => f.id === selectedFieldId) ?? null
    : null

  const allFields = steps.flatMap(s => s.fields)

  // ── save ───────────────────────────────────────────────────────────────────

  const save = async (kind: 'draft' | 'publish') => {
    if (!meta.title.trim()) {
      toast.push('Укажите название услуги', 'error')
      return
    }
    setSaving(kind)
    try {
      const payload = {
        title:       meta.title,
        category:    meta.category,
        org_name:    meta.org_name,
        description: meta.description,
        status:      kind === 'publish' ? 'published' : 'draft',
        form_schema: { steps },
      }
      let svcId = id
      if (id) {
        await servicesApi.update(id, payload)
        if (kind === 'publish') await servicesApi.publish(id)
      } else {
        const res = await servicesApi.create(payload)
        svcId = res.data.id
        if (kind === 'publish' && svcId) await servicesApi.publish(svcId)
      }
      toast.push(kind === 'publish' ? 'Услуга опубликована' : 'Черновик сохранён', 'success')
      navigate('/admin/services')
    } catch {
      toast.push('Ошибка сохранения', 'error')
    } finally {
      setSaving(null)
    }
  }

  // ── step/field mutations ───────────────────────────────────────────────────

  const updateField = useCallback((newField: BuilderField) => {
    setSteps(prev => prev.map(s => ({ ...s, fields: s.fields.map(f => f.id === newField.id ? newField : f) })))
  }, [])

  const moveField = (stepIdx: number, fieldIdx: number, dir: -1 | 1) => {
    setSteps(prev => {
      const next = [...prev]
      const fields = [...next[stepIdx].fields]
      const target = fieldIdx + dir
      if (target < 0 || target >= fields.length) return prev
      ;[fields[fieldIdx], fields[target]] = [fields[target], fields[fieldIdx]]
      next[stepIdx] = { ...next[stepIdx], fields }
      return next
    })
  }

  const deleteField = (stepIdx: number, fieldIdx: number) => {
    setSteps(prev => {
      const next = [...prev]
      next[stepIdx] = { ...next[stepIdx], fields: next[stepIdx].fields.filter((_, i) => i !== fieldIdx) }
      return next
    })
    setSelectedFieldId(null)
  }

  const addField = (stepIdx: number, field: BuilderField) => {
    setSteps(prev => {
      const next = [...prev]
      next[stepIdx] = { ...next[stepIdx], fields: [...next[stepIdx].fields, field] }
      return next
    })
    setSelectedFieldId(field.id)
  }

  const updateStep = (i: number, s: BuilderStep) => setSteps(prev => prev.map((x, j) => j === i ? s : x))
  const removeStep = (i: number) => { setSteps(prev => prev.filter((_, j) => j !== i)); setSelectedFieldId(null) }
  const moveStep   = (i: number, dir: -1 | 1) => {
    setSteps(prev => {
      const next = [...prev]
      const target = i + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[i], next[target]] = [next[target], next[i]]
      return next
    })
  }
  const addStep = () => setSteps(prev => [...prev, {
    id: 'step_' + Math.random().toString(36).slice(2, 6),
    title: 'Новый этап', fields: [],
  }])

  if (isLoading) {
    return (
      <div style={{ padding: 40 }}>
        <div className="skeleton" style={{ height: 36, width: 300, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 500 }} />
      </div>
    )
  }

  return (
    <div className="page-fade" style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--color-bg)', overflow: 'hidden' }}>

      <LeftPanel meta={meta} setMeta={setMeta} onSaveDraft={() => save('draft')} onPublish={() => save('publish')} saving={saving} />

      {/* Center canvas */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 28px',
          background: '#fff', borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0, zIndex: 5,
        }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/services')}>
            <I.ArrowLeft size={14} /> Назад к услугам
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              {id ? `Редактирование · #${id.slice(0, 8)}` : 'Новая услуга'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{meta.title || 'Без названия'}</div>
          </div>
          <span style={{ fontSize: 12, padding: '3px 10px', background: '#FEF3C7', color: '#92400E', borderRadius: 999, fontWeight: 500 }}>
            ● Черновик
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPreview(true)}>
            <I.Eye size={14} /> Предпросмотр
          </button>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 28px 60px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 4 }}>Холст формы</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Структура заявки</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4, marginBottom: 0 }}>
              {steps.length} этапов · {steps.reduce((n, s) => n + s.fields.length, 0)} полей
            </p>
          </div>

          <AiBlock onApply={newSteps => { setSteps(newSteps); setSelectedFieldId(null) }} />

          {steps.map((step, i) => (
            <StepBlock
              key={step.id} step={step} idx={i} total={steps.length}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onUpdateStep={s => updateStep(i, s)}
              onRemoveStep={() => removeStep(i)}
              onMoveStep={dir => moveStep(i, dir)}
              onAddField={f => addField(i, f)}
              onMoveField={(fi, dir) => moveField(i, fi, dir)}
              onDeleteField={fi => deleteField(i, fi)}
              allPrevFields={steps.filter((_, j) => j !== i).flatMap(s => s.fields)}
            />
          ))}

          <button
            onClick={addStep}
            style={{
              width: '100%', height: 52, marginTop: 8,
              background: '#fff', border: '1.5px dashed var(--color-border-strong)',
              borderRadius: 12, color: 'var(--color-text-2)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <I.Plus size={16} /> Добавить этап
          </button>
        </div>
      </main>

      <RightPanel
        field={selectedField}
        allFields={allFields}
        onChange={updateField}
        onClose={() => setSelectedFieldId(null)}
      />

      {showPreview && <PreviewDrawer steps={steps} title={meta.title} onClose={() => setShowPreview(false)} />}
    </div>
  )
}
