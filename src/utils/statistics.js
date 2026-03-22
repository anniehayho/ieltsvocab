import { loadVocabulary, loadQuizResults, loadStudySessions, loadDailyProgress } from './storage';

// Get vocabulary statistics
export const getVocabularyStats = () => {
  const vocabulary = loadVocabulary();

  const mastered = vocabulary.filter(w => w.status === 'mastered').length;
  const learning = vocabulary.filter(w => w.status === 'learning').length;
  const struggling = vocabulary.filter(w => w.status === 'struggling').length;
  const notStarted = vocabulary.length - mastered - learning - struggling;

  return {
    total: vocabulary.length,
    mastered,
    learning,
    struggling,
    notStarted
  };
};

// Calculate quiz accuracy
export const calculateQuizAccuracy = (timeframe = 'all') => {
  const results = loadQuizResults();

  let filteredResults = results;

  if (timeframe === 'week') {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    filteredResults = results.filter(r => new Date(r.date).getTime() > weekAgo);
  } else if (timeframe === 'month') {
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    filteredResults = results.filter(r => new Date(r.date).getTime() > monthAgo);
  }

  if (filteredResults.length === 0) return 0;

  const totalAccuracy = filteredResults.reduce((sum, r) => sum + r.accuracy, 0);
  return Math.round(totalAccuracy / filteredResults.length);
};

// Get weekly activity data
export const getWeeklyActivity = () => {
  const progress = loadDailyProgress();
  const weekData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayProgress = progress[dateStr] || { reviewCount: 0, studyTime: 0 };

    weekData.push({
      day: dayName,
      value: dayProgress.reviewCount || 0,
      studyTime: dayProgress.studyTime || 0
    });
  }

  return weekData;
};

// Get total study time
export const getTotalStudyTime = (timeframe = 'week') => {
  const progress = loadDailyProgress();
  let totalSeconds = 0;

  const now = Date.now();
  let cutoffTime = 0;

  if (timeframe === 'week') {
    cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
  } else if (timeframe === 'month') {
    cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
  }

  Object.entries(progress).forEach(([dateStr, data]) => {
    const dateTime = new Date(dateStr).getTime();
    if (timeframe === 'all' || dateTime > cutoffTime) {
      totalSeconds += data.studyTime || 0;
    }
  });

  const hours = totalSeconds / 3600;
  return hours.toFixed(1);
};

// Get average study time per day
export const getAverageStudyTime = (timeframe = 'week') => {
  const progress = loadDailyProgress();
  const now = Date.now();
  let cutoffTime = 0;
  let days = 7;

  if (timeframe === 'week') {
    cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
    days = 7;
  } else if (timeframe === 'month') {
    cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
    days = 30;
  }

  let totalSeconds = 0;
  let activeDays = 0;

  Object.entries(progress).forEach(([dateStr, data]) => {
    const dateTime = new Date(dateStr).getTime();
    if (timeframe === 'all' || dateTime > cutoffTime) {
      totalSeconds += data.studyTime || 0;
      if (data.studyTime > 0) activeDays++;
    }
  });

  if (activeDays === 0) return 0;

  const avgSeconds = totalSeconds / activeDays;
  const avgMinutes = avgSeconds / 60;

  return Math.round(avgMinutes);
};

// Get words learned this week
export const getWordsLearnedThisWeek = () => {
  const vocabulary = loadVocabulary();
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  return vocabulary.filter(word => {
    if (word.status === 'mastered' && word.lastReviewed) {
      return new Date(word.lastReviewed).getTime() > weekAgo;
    }
    return false;
  }).length;
};

// Get most reviewed words
export const getMostReviewedWords = (limit = 5) => {
  const vocabulary = loadVocabulary();

  return [...vocabulary]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, limit);
};

// Get recently studied words
export const getRecentlyStudiedWords = (limit = 4) => {
  const vocabulary = loadVocabulary();

  return [...vocabulary]
    .filter(word => word.lastReviewed)
    .sort((a, b) => new Date(b.lastReviewed) - new Date(a.lastReviewed))
    .slice(0, limit);
};

// Get word of the day (deterministic based on date)
export const getWordOfTheDay = () => {
  const vocabulary = loadVocabulary();
  if (vocabulary.length === 0) return null;

  const today = new Date().toISOString().split('T')[0];
  const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % vocabulary.length;

  return vocabulary[index];
};

// Calculate improvement percentage
export const calculateImprovement = (timeframe = 'week') => {
  const results = loadQuizResults();
  if (results.length < 2) return 0;

  const now = Date.now();
  let cutoffTime = 0;

  if (timeframe === 'week') {
    cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
  } else if (timeframe === 'month') {
    cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
  }

  const recentResults = results.filter(r => new Date(r.date).getTime() > cutoffTime);

  if (recentResults.length < 2) return 0;

  const half = Math.floor(recentResults.length / 2);
  const firstHalf = recentResults.slice(0, half);
  const secondHalf = recentResults.slice(half);

  const firstAvg = firstHalf.reduce((sum, r) => sum + r.accuracy, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.accuracy, 0) / secondHalf.length;

  return Math.round(secondAvg - firstAvg);
};

// Get progress by category
export const getProgressByCategory = () => {
  const vocabulary = loadVocabulary();
  const categories = {};

  vocabulary.forEach(word => {
    const cat = word.category || 'Other';
    if (!categories[cat]) {
      categories[cat] = {
        total: 0,
        mastered: 0,
        learning: 0,
        struggling: 0
      };
    }

    categories[cat].total++;
    if (word.status === 'mastered') categories[cat].mastered++;
    else if (word.status === 'learning') categories[cat].learning++;
    else if (word.status === 'struggling') categories[cat].struggling++;
  });

  return categories;
};

// Get progress by band level
export const getProgressByBandLevel = () => {
  const vocabulary = loadVocabulary();
  const bands = {};

  vocabulary.forEach(word => {
    const band = word.bandLevel || 'Unknown';
    if (!bands[band]) {
      bands[band] = {
        total: 0,
        mastered: 0,
        learning: 0,
        struggling: 0
      };
    }

    bands[band].total++;
    if (word.status === 'mastered') bands[band].mastered++;
    else if (word.status === 'learning') bands[band].learning++;
    else if (word.status === 'struggling') bands[band].struggling++;
  });

  return bands;
};
