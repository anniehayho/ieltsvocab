import { useState, useEffect } from 'react';
import './Auth.css';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGoogleRedirect, getGoogleRedirectResult } from '../firebase/authService';

const Auth = ({ onAuthSuccess, onSkipLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useRedirect, setUseRedirect] = useState(false);

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      setLoading(true);
      const result = await getGoogleRedirectResult();
      setLoading(false);

      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        onAuthSuccess(result.user);
      }
    };

    checkRedirectResult();
  }, [onAuthSuccess]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await signInWithEmail(email, password);
    } else {
      if (!displayName.trim()) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      result = await signUpWithEmail(email, password, displayName);
    }

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.user) {
      onAuthSuccess(result.user);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    // Use redirect method if previously popup was blocked
    if (useRedirect) {
      await signInWithGoogleRedirect();
      // Page will redirect, loading will stay true
      return;
    }

    // Try popup first
    const result = await signInWithGoogle();
    setLoading(false);

    if (result.error) {
      // Better error message for popup blocker
      if (result.error.includes('popup-blocked') || result.error.includes('auth/popup-blocked')) {
        setUseRedirect(true);
        setError('Popup was blocked. Click "Continue with Google" again to use a different sign-in method.');
      } else if (result.error.includes('popup-closed-by-user') || result.error.includes('auth/popup-closed-by-user')) {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError(result.error);
      }
    } else if (result.user) {
      onAuthSuccess(result.user);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-mark-large">V</div>
          <h1>IELTS Vocab</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Welcome back! Sign in to continue learning.' : 'Create an account to start learning.'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-button primary" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="auth-button google"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="switch-button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={loading}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="offline-button"
          onClick={onSkipLogin}
          disabled={loading}
        >
          Continue Offline (No Sync)
        </button>
      </div>
    </div>
  );
};

export default Auth;
