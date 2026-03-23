// localStorage utility functions with user-specific data isolation

const BASE_KEYS = {
  VOCABULARY: 'ielts_vocabulary',
  USER_STATS: 'ielts_user_stats',
  STUDY_SESSIONS: 'ielts_study_sessions',
  QUIZ_RESULTS: 'ielts_quiz_results',
  DAILY_PROGRESS: 'ielts_daily_progress',
  SETTINGS: 'ielts_settings'
};

const SYSTEM_KEYS = {
  CURRENT_USER: 'ielts_current_user',
  GUEST_MODE: 'ielts_guest_mode'
};

// Get current user ID (returns 'guest' if not authenticated)
const getCurrentUserId = () => {
  const currentUser = localStorage.getItem(SYSTEM_KEYS.CURRENT_USER);
  return currentUser || 'guest';
};

// Get user-specific storage key
const getUserKey = (baseKey) => {
  const userId = getCurrentUserId();
  return `${baseKey}_${userId}`;
};

// Set current user (call this when user logs in/out)
export const setCurrentUser = (userId) => {
  if (userId) {
    localStorage.setItem(SYSTEM_KEYS.CURRENT_USER, userId);
    localStorage.removeItem(SYSTEM_KEYS.GUEST_MODE);
  } else {
    localStorage.removeItem(SYSTEM_KEYS.CURRENT_USER);
    localStorage.setItem(SYSTEM_KEYS.GUEST_MODE, 'true');
  }
};

// Get current user ID for external use
export const getCurrentStorageUser = () => {
  return getCurrentUserId();
};

// Clear current user's data (for logout)
export const clearCurrentUserData = () => {
  const userId = getCurrentUserId();
  Object.values(BASE_KEYS).forEach(baseKey => {
    const key = `${baseKey}_${userId}`;
    localStorage.removeItem(key);
  });
};

// Generic localStorage helpers (user-specific)
export const saveToStorage = (baseKey, data) => {
  try {
    const userKey = getUserKey(baseKey);
    localStorage.setItem(userKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${baseKey} to localStorage:`, error);
    return false;
  }
};

export const loadFromStorage = (baseKey, defaultValue = null) => {
  try {
    const userKey = getUserKey(baseKey);
    const item = localStorage.getItem(userKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${baseKey} from localStorage:`, error);
    return defaultValue;
  }
};

export const removeFromStorage = (baseKey) => {
  try {
    const userKey = getUserKey(baseKey);
    localStorage.removeItem(userKey);
    return true;
  } catch (error) {
    console.error(`Error removing ${baseKey} from localStorage:`, error);
    return false;
  }
};

// Vocabulary operations
export const saveVocabulary = (vocabulary) => {
  return saveToStorage(BASE_KEYS.VOCABULARY, vocabulary);
};

export const loadVocabulary = () => {
  return loadFromStorage(BASE_KEYS.VOCABULARY, []);
};

export const updateWord = (wordId, updates) => {
  const vocabulary = loadVocabulary();
  const updatedVocab = vocabulary.map(word =>
    word.id === wordId
      ? { ...word, ...updates, lastReviewed: new Date().toISOString() }
      : word
  );
  saveVocabulary(updatedVocab);
  return updatedVocab;
};

export const incrementWordReview = (wordId) => {
  const vocabulary = loadVocabulary();
  const updatedVocab = vocabulary.map(word =>
    word.id === wordId
      ? {
          ...word,
          reviewCount: (word.reviewCount || 0) + 1,
          lastReviewed: new Date().toISOString()
        }
      : word
  );
  saveVocabulary(updatedVocab);
  return updatedVocab;
};

// User stats operations
export const saveUserStats = (stats) => {
  return saveToStorage(BASE_KEYS.USER_STATS, stats);
};

export const loadUserStats = () => {
  const defaultStats = {
    totalWordsLearned: 0,
    totalReviews: 0,
    totalQuizzesTaken: 0,
    totalStudyTime: 0, // in seconds
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: new Date().toISOString(),
    startDate: new Date().toISOString()
  };
  return loadFromStorage(BASE_KEYS.USER_STATS, defaultStats);
};

export const updateUserStats = (updates) => {
  const stats = loadUserStats();
  const updatedStats = { ...stats, ...updates };
  saveUserStats(updatedStats);
  return updatedStats;
};

// Study session tracking
export const saveStudySession = (session) => {
  const sessions = loadFromStorage(BASE_KEYS.STUDY_SESSIONS, []);
  const newSession = {
    id: Date.now(),
    date: new Date().toISOString(),
    wordsStudied: session.wordsStudied || 0,
    duration: session.duration || 0, // in seconds
    type: session.type || 'flashcard'
  };
  sessions.push(newSession);

  // Keep only last 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentSessions = sessions.filter(s => new Date(s.date).getTime() > thirtyDaysAgo);

  saveToStorage(BASE_KEYS.STUDY_SESSIONS, recentSessions);
  return recentSessions;
};

export const loadStudySessions = () => {
  return loadFromStorage(BASE_KEYS.STUDY_SESSIONS, []);
};

// Quiz results tracking
export const saveQuizResult = (result) => {
  const results = loadFromStorage(BASE_KEYS.QUIZ_RESULTS, []);
  const newResult = {
    id: Date.now(),
    date: new Date().toISOString(),
    score: result.score || 0,
    totalQuestions: result.totalQuestions || 0,
    accuracy: result.accuracy || 0,
    duration: result.duration || 0, // in seconds
    wordsQuizzed: result.wordsQuizzed || []
  };
  results.push(newResult);

  // Keep only last 50 results
  const recentResults = results.slice(-50);

  saveToStorage(BASE_KEYS.QUIZ_RESULTS, recentResults);
  return recentResults;
};

export const loadQuizResults = () => {
  return loadFromStorage(BASE_KEYS.QUIZ_RESULTS, []);
};

// Daily progress tracking
export const updateDailyProgress = () => {
  const today = new Date().toISOString().split('T')[0];
  const progress = loadFromStorage(BASE_KEYS.DAILY_PROGRESS, {});

  if (!progress[today]) {
    progress[today] = {
      date: today,
      wordsStudied: 0,
      quizzesTaken: 0,
      studyTime: 0,
      reviewCount: 0
    };
  }

  // Keep only last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

  Object.keys(progress).forEach(date => {
    if (date < ninetyDaysAgoStr) {
      delete progress[date];
    }
  });

  saveToStorage(BASE_KEYS.DAILY_PROGRESS, progress);
  return progress;
};

export const incrementDailyProgress = (field, amount = 1) => {
  const today = new Date().toISOString().split('T')[0];
  const progress = loadFromStorage(BASE_KEYS.DAILY_PROGRESS, {});

  if (!progress[today]) {
    progress[today] = {
      date: today,
      wordsStudied: 0,
      quizzesTaken: 0,
      studyTime: 0,
      reviewCount: 0
    };
  }

  progress[today][field] = (progress[today][field] || 0) + amount;
  saveToStorage(BASE_KEYS.DAILY_PROGRESS, progress);
  return progress;
};

export const loadDailyProgress = () => {
  return loadFromStorage(BASE_KEYS.DAILY_PROGRESS, {});
};

// Calculate streak
export const calculateStreak = () => {
  const progress = loadDailyProgress();
  const dates = Object.keys(progress).sort().reverse();

  if (dates.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const dateStr of dates) {
    const checkDate = new Date(dateStr);
    checkDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate - checkDate) / (1000 * 60 * 60 * 24));

    if (diffDays === streak) {
      const dayProgress = progress[dateStr];
      // Check if there was actual activity
      if (dayProgress.reviewCount > 0 || dayProgress.quizzesTaken > 0) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
};

// Settings
export const saveSettings = (settings) => {
  return saveToStorage(BASE_KEYS.SETTINGS, settings);
};

export const loadSettings = () => {
  const defaultSettings = {
    studyReminders: true,
    dailyGoal: 20, // words per day
    theme: 'light',
    soundEffects: true
  };
  return loadFromStorage(BASE_KEYS.SETTINGS, defaultSettings);
};

// Clear all data (for testing/reset)
export const clearAllData = () => {
  clearCurrentUserData();
};

// Export storage keys
export const STORAGE_KEYS = BASE_KEYS;
