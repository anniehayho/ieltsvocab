import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import MobileHeader from './components/MobileHeader';
import Home from './components/Home';
import Browse from './components/Browse';
import Study from './components/Study';
import Quiz from './components/Quiz';
import Progress from './components/Progress';
import Auth from './components/Auth';
import { initializeVocabulary } from './data/vocabularyData';
import { loadUserStats, calculateStreak, setCurrentUser } from './utils/storage';
import { onAuthChange, getCurrentUser, logOut } from './firebase/authService';
import { initializeUserData, getVocabulary, getUserStats } from './data/hybridDataService';
import { initSessionTimeout, cleanupSessionTimeout, resetSessionTimer } from './utils/sessionTimeout';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [vocabulary, setVocabulary] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      setAuthLoading(false);

      if (authUser) {
        // User is signed in, set user-specific localStorage namespace
        setCurrentUser(authUser.uid);
        // Initialize Firebase data
        await initializeUserData();
        await loadData();
      } else {
        // User is signed out, use guest localStorage namespace
        setCurrentUser(null);
        const vocab = initializeVocabulary();
        setVocabulary(vocab);

        const stats = loadUserStats();
        const currentStreak = calculateStreak();
        setUserStats({ ...stats, currentStreak });
      }
    });

    return () => unsubscribe();
  }, []);

  // Session timeout management - only for logged-in users
  useEffect(() => {
    if (user) {
      // Initialize session timeout for logged-in users only
      initSessionTimeout(
        // Warning callback - 1 minute before timeout
        () => {
          setShowTimeoutWarning(true);
        },
        // Timeout callback - auto logout after 15 minutes
        async () => {
          console.log('Session timeout - logging out user');
          await handleLogout();
          alert('You have been logged out due to inactivity.');
        }
      );

      return () => {
        // Cleanup session timeout when user logs out or component unmounts
        cleanupSessionTimeout();
      };
    }
  }, [user]);

  const loadData = async () => {
    // Load vocabulary (from Firebase if authenticated, localStorage otherwise)
    const vocab = await getVocabulary();
    setVocabulary(vocab);

    // Load user stats
    const stats = await getUserStats();
    const currentStreak = calculateStreak();
    setUserStats({ ...stats, currentStreak });
  };

  const refreshVocabulary = async () => {
    await loadData();
  };

  const handleAuthSuccess = async (authUser) => {
    setUser(authUser);
    // Set user-specific localStorage namespace
    setCurrentUser(authUser.uid);
    await initializeUserData();
    await loadData();
  };

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    setOfflineMode(false);
    // Switch to guest localStorage namespace
    setCurrentUser(null);
    // Clear current data and reload from guest localStorage
    const vocab = initializeVocabulary();
    setVocabulary(vocab);

    const stats = loadUserStats();
    const currentStreak = calculateStreak();
    setUserStats({ ...stats, currentStreak });
  };

  const handleSkipLogin = () => {
    setOfflineMode(true);
    setAuthLoading(false);
    // Use guest localStorage namespace
    setCurrentUser(null);
    // Use localStorage only
    const vocab = initializeVocabulary();
    setVocabulary(vocab);

    const stats = loadUserStats();
    const currentStreak = calculateStreak();
    setUserStats({ ...stats, currentStreak });
  };

  const handleStayLoggedIn = () => {
    // User wants to continue - reset the timer
    setShowTimeoutWarning(false);
    resetSessionTimer();
  };

  const handleTimeoutLogout = async () => {
    // User clicked "Logout Now" in warning dialog
    setShowTimeoutWarning(false);
    await handleLogout();
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home vocabulary={vocabulary} userStats={userStats} onNavigate={setCurrentView} />;
      case 'browse':
        return <Browse vocabulary={vocabulary} refreshVocabulary={refreshVocabulary} />;
      case 'study':
        return <Study vocabulary={vocabulary} refreshVocabulary={refreshVocabulary} />;
      case 'quiz':
        return <Quiz vocabulary={vocabulary} refreshVocabulary={refreshVocabulary} />;
      case 'progress':
        return <Progress vocabulary={vocabulary} />;
      default:
        return <Home vocabulary={vocabulary} userStats={userStats} onNavigate={setCurrentView} />;
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show auth screen if not logged in and not in offline mode
  if (!user && !offlineMode) {
    return <Auth onAuthSuccess={handleAuthSuccess} onSkipLogin={handleSkipLogin} />;
  }

  // Show main app if logged in OR in offline mode
  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />
      <div className="app-main">
        <MobileHeader user={user} onLogout={handleLogout} />
        <main className="main-content">
          {renderView()}
        </main>
      </div>
      <TabBar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Session Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="modal-overlay session-timeout-overlay">
          <div className="session-timeout-modal">
            <div className="timeout-icon">⏰</div>
            <h2>Still there?</h2>
            <p>You've been inactive for 14 minutes.</p>
            <p className="timeout-warning">You'll be logged out in 1 minute due to inactivity.</p>
            <div className="timeout-actions">
              <button className="btn-secondary" onClick={handleTimeoutLogout}>
                Logout Now
              </button>
              <button className="btn-primary" onClick={handleStayLoggedIn}>
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
