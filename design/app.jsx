// ===== Main App Shell + Routing =====

const App = () => {
  const [route, setRoute] = React.useState({ page: 'home', params: {} });
  const [showLogin, setShowLogin] = React.useState(false);

  const go = (page, params = {}) => {
    setRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  let Page;
  if (route.page === 'home')              Page = <HomePage go={go} />;
  else if (route.page === 'services')     Page = <ServicesPage go={go} initialDir={route.params.dir} />;
  else if (route.page === 'service')      Page = <ServiceDetailPage go={go} serviceId={route.params.id} />;
  else if (route.page === 'apply')        Page = <ApplyPage go={go} serviceId={route.params.id} />;
  else if (route.page === 'cabinet')      Page = <CabinetPage go={go} />;
  else if (route.page === 'admin')        Page = <AdminPage go={go} />;
  else if (route.page === 'formbuilder')  Page = <FormBuilderPage go={go} serviceId={route.params.id} />;
  else if (route.page === 'knowledge')    Page = <KnowledgePage go={go} />;
  else if (route.page === 'news')         Page = <NewsPage go={go} />;
  else if (route.page === 'contacts')     Page = <ContactsPage go={go} />;
  else Page = <HomePage go={go} />;

  const isAdmin = route.page === 'admin' || route.page === 'formbuilder';

  // Header active state mapping
  const headerCurrent =
    route.page === 'service' || route.page === 'apply' ? 'services' : route.page;

  return (
    <ToastProvider>
      {!isAdmin && <Header go={go} current={headerCurrent} onLogin={() => setShowLogin(true)} />}
      {isAdmin && <AdminTopBar go={go} />}
      <main data-screen-label={`Page: ${route.page}`}>{Page}</main>
      {!isAdmin && <Footer go={go} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={(role) => {
        setShowLogin(false);
        if (role === 'admin') go('admin'); else go('cabinet');
      }} />}
    </ToastProvider>
  );
};

// Compact header for admin pages — different chrome to signal context
const AdminTopBar = ({ go }) => (
  <header style={{
    position: 'sticky', top: 0, zIndex: 50,
    background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', height: 64, padding: '0 28px', gap: 24 }}>
      <a onClick={() => go('home')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <div className="logo-mark" style={{ background: 'var(--color-accent)' }}>Q</div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Qolday <span style={{ color: 'var(--color-accent)' }}>AI</span></div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Admin Console</div>
        </div>
      </a>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', width: 320 }}>
          <I.Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input placeholder="Поиск по заявкам, пользователям…" style={{
            width: '100%', height: 34, paddingLeft: 36, paddingRight: 12,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, color: '#fff', fontSize: 13, outline: 'none',
          }} />
        </div>
        <button style={{
          width: 34, height: 34, border: 'none', background: 'rgba(255,255,255,0.06)',
          borderRadius: 6, color: '#CBD5E1', cursor: 'pointer', position: 'relative',
        }}>
          <I.Bell size={16} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--color-danger)', borderRadius: '50%', border: '2px solid #0F172A' }} />
        </button>
        <button onClick={() => go('home')} style={{
          height: 34, padding: '0 12px', border: '1px solid rgba(255,255,255,0.12)',
          background: 'transparent', color: '#CBD5E1', borderRadius: 6, fontSize: 13, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <I.ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} />Выйти из админки
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: 'var(--color-accent)',
          color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>АА</div>
      </div>
    </div>
  </header>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
