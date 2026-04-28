import { useState } from 'react'
import { authApi, mockApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/components/Toast'
import { Logo } from '@/components/Layout/Header'
import { I } from '@/components/icons'

interface Props {
  onClose: () => void
  onSuccess: (role: string) => void
}

export function LoginModal({ onClose, onSuccess }: Props) {
  const { setAuth } = useAuthStore()
  const { push } = useToast()
  const [mode, setMode] = useState<'egov' | 'manual'>('egov')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [iin, setIin] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEgov = async () => {
    if (iin.length < 12) { push('Введите корректный ИИН/БИН (12 цифр)', 'error'); return }
    setLoading(true)
    try {
      const egovRes = await mockApi.egov(iin)
      const egov = egovRes.data
      const res = await authApi.login(iin, egov.full_name, egov.org_name ?? '')
      setAuth(res.data.user, res.data.token)
      push('Вход выполнен успешно', 'success')
      onSuccess(res.data.user.role)
    } catch {
      push('Ошибка авторизации. Проверьте ИИН/БИН.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size={28} withText={false} />
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }}>
            <I.X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 28px 28px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 6, letterSpacing: '-0.01em' }}>
            Войти в Qoldau AI
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 0, marginBottom: 20 }}>
            Используйте eGov для быстрого входа
          </p>

          {/* Role switcher */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-2)', padding: 3, borderRadius: 8, marginBottom: 20 }}>
            {[
              { id: 'user',  label: 'Пользователь' },
              { id: 'admin', label: 'Сотрудник / админ' },
            ].map((r) => (
              <button key={r.id} type="button" onClick={() => {
                setRole(r.id as 'user' | 'admin')
                setIin(r.id === 'admin' ? '000000000000' : '')
              }} style={{
                flex: 1, height: 32, border: 'none', borderRadius: 6,
                background: role === r.id ? '#fff' : 'transparent',
                color: role === r.id ? 'var(--color-text)' : 'var(--color-text-3)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                boxShadow: role === r.id ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
              }}>{r.label}</button>
            ))}
          </div>

          {/* IIN input */}
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">ИИН / БИН</label>
            <input
              className="input"
              type="text"
              placeholder="123456789012"
              value={iin}
              onChange={(e) => setIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
              style={{ letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
            />
            <div className="field-help">{iin.length}/12 цифр</div>
          </div>

          <button
            className="btn btn-primary btn-lg btn-block"
            style={{ height: 48 }}
            onClick={handleEgov}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                }} className="spin" />
                Вход…
              </>
            ) : (
              <><I.Shield size={18} /> Войти через eGov</>
            )}
          </button>

          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)' }}>
            <strong style={{ color: 'var(--color-text-2)' }}>Тестовые аккаунты:</strong><br />
            Админ: <code style={{ fontFamily: 'monospace' }}>000000000000</code> · Пользователь: любой 12-значный номер
          </div>
        </div>
      </div>
    </div>
  )
}
