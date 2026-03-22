import './MobileHeader.css';

const MobileHeader = ({ user, onLogout }) => {
  return (
    <header className="mobile-header mobile-only">
      <div className="mobile-header-content">
        {user ? (
          <>
            <div className="mobile-user-info">
              <div className="mobile-avatar">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{user.displayName || 'User'}</div>
                <div className="mobile-user-email">{user.email}</div>
              </div>
            </div>
            <button className="mobile-logout-btn" onClick={onLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="mobile-offline-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <span>Offline Mode</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
