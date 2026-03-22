import './Sidebar.css';

const Sidebar = ({ currentView, setCurrentView, user, onLogout }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'house' },
    { id: 'browse', label: 'Browse', icon: 'book-open' },
    { id: 'study', label: 'Study', icon: 'layers' },
    { id: 'quiz', label: 'Quiz', icon: 'target' },
    { id: 'progress', label: 'Progress', icon: 'trending-up' }
  ];

  return (
    <aside className="sidebar desktop-only">
      <div className="sidebar-logo">
        <div className="logo-mark">V</div>
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
            {currentView === item.id ? (
              <div className="nav-dot"></div>
            ) : (
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon === 'house' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
                {item.icon === 'book-open' && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>}
                {item.icon === 'layers' && <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>}
                {item.icon === 'target' && <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>}
                {item.icon === 'trending-up' && <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>}
              </svg>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {user ? (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.displayName || 'User'}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="sidebar-footer">
          <div className="offline-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <span>Offline Mode</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
