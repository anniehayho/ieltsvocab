// localStorage utility functions

const STORAGE_KEYS = {
  VOCABULARY: 'ielts_vocabulary',
  USER_STATS: 'ielts_user_stats',
  STUDY_SESSIONS: 'ielts_study_sessions',
  QUIZ_RESULTS: 'ielts_quiz_results',
  DAILY_PROGRESS: 'ielts_daily_progress',
  SETTINGS: 'ielts_settings'
};

// Generic localStorage helpers
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

// Vocabulary operations
export const saveVocabulary = (vocabulary) => {
  return saveToStorage(STORAGE_KEYS.VOCABULARY, vocabulary);
};

export const loadVocabulary = () => {
  return loadFromStorage(STORAGE_KEYS.VOCABULARY, []);
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
  return saveToStorage(STORAGE_KEYS.USER_STATS, stats);
};

export const loadUserStats = () => {
  const defaultStats = {
    totalWordsLearned: 0,
    totalReviews: 0,
    totalQuizzesTaken: 0,
    totalStudyTime: 0, // in seconds
    currentStreak: 7,
    longestStreak: 7,
    lastStudyDate: new Date().toISOString(),
    startDate: new Date().toISOString()
  };
  return loadFromStorage(STORAGE_KEYS.USER_STATS, defaultStats);
};

export const updateUserStats = (updates) => {
  const stats = loadUserStats();
  const updatedStats = { ...stats, ...updates };
  saveUserStats(updatedStats);
  return updatedStats;
};

// Study session tracking
export const saveStudySession = (session) => {
  const sessions = loadFromStorage(STORAGE_KEYS.STUDY_SESSIONS, []);
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

  saveToStorage(STORAGE_KEYS.STUDY_SESSIONS, recentSessions);
  return recentSessions;
};

export const loadStudySessions = () => {
  return loadFromStorage(STORAGE_KEYS.STUDY_SESSIONS, []);
};

// Quiz results tracking
export const saveQuizResult = (result) => {
  const results = loadFromStorage(STORAGE_KEYS.QUIZ_RESULTS, []);
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

  saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, recentResults);
  return recentResults;
};

export const loadQuizResults = () => {
  return loadFromStorage(STORAGE_KEYS.QUIZ_RESULTS, []);
};

// Daily progress tracking
export const updateDailyProgress = () => {
  const today = new Date().toISOString().split('T')[0];
  const progress = loadFromStorage(STORAGE_KEYS.DAILY_PROGRESS, {});

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

  saveToStorage(STORAGE_KEYS.DAILY_PROGRESS, progress);
  return progress;
};

export const incrementDailyProgress = (field, amount = 1) => {
  const today = new Date().toISOString().split('T')[0];
  const progress = loadFromStorage(STORAGE_KEYS.DAILY_PROGRESS, {});

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
  saveToStorage(STORAGE_KEYS.DAILY_PROGRESS, progress);
  return progress;
};

export const loadDailyProgress = () => {
  return loadFromStorage(STORAGE_KEYS.DAILY_PROGRESS, {});
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
  return saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};

export const loadSettings = () => {
  const defaultSettings = {
    studyReminders: true,
    dailyGoal: 20, // words per day
    theme: 'light',
    soundEffects: true
  };
  return loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
};

// Clear all data (for testing/reset)
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};

// Export storage keys
export { STORAGE_KEYS };
