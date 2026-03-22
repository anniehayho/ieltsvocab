import './TabBar.css';

const TabBar = ({ currentView, setCurrentView }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'browse', label: 'Browse', icon: 'book-open' },
    { id: 'study', label: 'Study', icon: 'layers' },
    { id: 'quiz', label: 'Quiz', icon: 'clipboard' },
    { id: 'progress', label: 'Progress', icon: 'chart' }
  ];

  return (
    <div className="tab-bar-container mobile-only">
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${currentView === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentView(tab.id)}
          >
            <svg className="icon icon-sm" viewBox="0 0 24 24">
              {tab.icon === 'home' && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
              {tab.icon === 'book-open' && <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>}
              {tab.icon === 'layers' && <polygon points="12 2 2 7 12 12 22 7 12 2" />}
              {tab.icon === 'clipboard' && <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />}
              {tab.icon === 'chart' && <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /></>}
            </svg>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
