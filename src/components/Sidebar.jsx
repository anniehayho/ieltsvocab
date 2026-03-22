import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'browse', label: 'Browse', icon: 'book-open' },
    { id: 'study', label: 'Study', icon: 'layers' },
    { id: 'quiz', label: 'Quiz', icon: 'clipboard-list' },
    { id: 'progress', label: 'Progress', icon: 'bar-chart-2' }
  ];

  return (
    <aside className="sidebar desktop-only">
      <div className="sidebar-logo">
        <div className="logo-mark"></div>
        <h1 className="logo-text">IELTS Vocab</h1>
      </div>

      <div className="sidebar-spacer"></div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            <svg className="icon icon-sm" viewBox="0 0 24 24">
              {item.icon === 'home' && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
              {item.icon === 'book-open' && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>}
              {item.icon === 'layers' && <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>}
              {item.icon === 'clipboard-list' && <><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="15" y2="16" /></>}
              {item.icon === 'bar-chart-2' && <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>}
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
