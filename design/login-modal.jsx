// ===== Login Modal =====

const LoginModal = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const [mode, setMode] = React.useState('login');
  const [role, setRole] = React.useState('user');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.push(role === 'admin' ? 'Вход в админ-панель' : 'Вход выполнен', 'success');
      onSuccess?.(role);
    }, 700);
  };

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
            {mode === 'login' ? 'Войти в Qolday AI' : 'Регистрация'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 0, marginBottom: 20 }}>
            {mode === 'login' ? 'Используйте eGov для быстрого входа' : 'Создайте аккаунт за 2 минуты'}
          </p>

          <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-2)', padding: 3, borderRadius: 8, marginBottom: 16 }}>
            {[
              { id: 'user',  label: 'Пользователь' },
              { id: 'admin', label: 'Сотрудник / админ' },
            ].map(r => (
              <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
                flex: 1, height: 32, border: 'none', borderRadius: 6,
                background: role === r.id ? '#fff' : 'transparent',
                color:      role === r.id ? 'var(--color-text)' : 'var(--color-text-3)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                boxShadow:  role === r.id ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
              }}>{r.label}</button>
            ))}
          </div>

          <button className="btn btn-primary btn-lg btn-block" style={{ height: 48 }}
            onClick={() => { toast.push('Демо: вход через eGov', 'info'); onSuccess?.(role); }}>
            <I.Shield size={18} /> Войти через eGov
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>или</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Email</label>
              <input className="input" type="email" placeholder="example@mail.kz"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Пароль</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 8, top: 8, width: 28, height: 28,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4,
                }}><I.Eye size={16} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-2)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--color-accent)' }} /> Запомнить меня
              </label>
              <a style={{ fontSize: 13, color: 'var(--color-accent)', cursor: 'pointer' }}>Забыли пароль?</a>
            </div>
            <button type="submit" className="btn btn-secondary btn-block" disabled={loading}>
              {loading ? (
                <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--color-border-strong)', borderTopColor: 'var(--color-accent)', animation: 'spin 700ms linear infinite' }} />Вход…</>
              ) : 'Войти по паролю'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--color-text-3)' }}>
            {mode === 'login' ? (
              <>Нет аккаунта? <a onClick={() => setMode('register')} style={{ color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 500 }}>Зарегистрироваться</a></>
            ) : (
              <>Уже есть аккаунт? <a onClick={() => setMode('login')} style={{ color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 500 }}>Войти</a></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

window.LoginModal = LoginModal;
