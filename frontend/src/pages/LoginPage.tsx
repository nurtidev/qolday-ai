import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi, mockApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { I } from '@/components/icons'
import { useToast } from '@/components/Toast'
import { Logo } from '@/components/Layout/Header'

export function LoginPage() {
  const [role, setRole]       = useState<'user' | 'admin'>('user')
  const [iin, setIin]         = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()
  const toast       = useToast()

  const handleEgov = async (e: React.FormEvent) => {
    e.preventDefault()
    if (iin.length < 12) {
      setError('ИИН/БИН должен содержать 12 цифр')
      return
    }
    setLoading(true)
    setError('')
    try {
      const egovRes = await mockApi.egov(iin)
      const egov    = egovRes.data
      const res     = await authApi.login(iin, egov.full_name, egov.org_name ?? '')
      setAuth(res.data.user, res.data.token)
      toast.push('Вход выполнен успешно', 'success')
      if (res.data.user.role === 'admin' || res.data.user.role === 'author') {
        navigate('/admin')
      } else {
        navigate('/cabinet')
      }
    } catch {
      setError('Ошибка авторизации. Проверьте ИИН/БИН.')
    } finally {
      setLoading(false)
    }
  }

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault()
    toast.push('Вход по паролю в разработке', 'info')
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Logo size={28} withText={false} />
            <Link to="/" className="btn btn-ghost btn-sm" style={{ width: 32, padding: 0 }}>
              <I.X size={16} />
            </Link>
          </div>

          <div style={{ padding: '20px 28px 28px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 6, letterSpacing: '-0.01em' }}>
              {mode === 'login' ? 'Войти в Qoldau AI' : 'Регистрация'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 0, marginBottom: 20 }}>
              {mode === 'login' ? 'Используйте eGov для быстрого входа' : 'Создайте аккаунт за 2 минуты'}
            </p>

            {/* Role switcher */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-2)', padding: 3, borderRadius: 8, marginBottom: 20 }}>
              {([
                { id: 'user',  label: 'Пользователь' },
                { id: 'admin', label: 'Сотрудник / Админ' },
              ] as { id: 'user' | 'admin'; label: string }[]).map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    flex: 1, height: 32, border: 'none', borderRadius: 6,
                    background: role === r.id ? '#fff' : 'transparent',
                    color:      role === r.id ? 'var(--color-text)' : 'var(--color-text-3)',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    boxShadow: role === r.id ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                    transition: 'all 120ms',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* eGov form */}
            <form onSubmit={handleEgov}>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">ИИН / БИН</label>
                <input
                  className="input"
                  type="text"
                  value={iin}
                  onChange={e => setIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="123456789012"
                  maxLength={12}
                  style={{ letterSpacing: '0.08em', fontSize: 15 }}
                />
                <div className="field-help">{iin.length}/12 · Для теста: <strong>000000000000</strong> (админ) или любой 12-значный</div>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--color-danger-soft)', borderRadius: 8, marginBottom: 12, fontSize: 13, color: '#B91C1C' }}>
                  <I.Alert size={15} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block" style={{ height: 48 }}>
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 700ms linear infinite', display: 'inline-block' }} />
                    Загрузка…
                  </>
                ) : (
                  <><I.Shield size={18} /> Войти через eGov</>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>или</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            {/* Email/password form */}
            <form onSubmit={handlePassword}>
              <div style={{ marginBottom: 14 }}>
                <label className="field-label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="example@mail.kz"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="field-label">Пароль</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: 'absolute', right: 8, top: 8,
                      width: 28, height: 28, background: 'none', border: 'none',
                      cursor: 'pointer', color: 'var(--color-text-3)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4,
                    }}
                  >
                    <I.Eye size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  Запомнить меня
                </label>
                <button type="button" onClick={() => toast.push('Сброс пароля в разработке', 'info')}
                  style={{ fontSize: 13, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Забыли пароль?
                </button>
              </div>

              <button type="submit" className="btn btn-secondary btn-block">
                Войти по паролю
              </button>
            </form>

            {/* Register link */}
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--color-text-3)' }}>
              {mode === 'login' ? (
                <>Нет аккаунта?{' '}
                  <button type="button" onClick={() => setMode('register')}
                    style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0, fontSize: 13 }}>
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <>Уже есть аккаунт?{' '}
                  <button type="button" onClick={() => setMode('login')}
                    style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0, fontSize: 13 }}>
                    Войти
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
