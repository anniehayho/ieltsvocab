import { useState, useEffect } from 'react';
import './Progress.css';
import {
  getVocabularyStats,
  getWeeklyActivity,
  getRecentlyStudiedWords,
  calculateQuizAccuracy,
  getTotalStudyTime,
  getAverageStudyTime,
  getWordsLearnedThisWeek,
  calculateImprovement
} from '../utils/statistics';
import { loadUserStats } from '../utils/storage';

const Progress = ({ vocabulary }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [stats, setStats] = useState({
    mastered: 0,
    learning: 0,
    struggling: 0,
    notStarted: 0,
    total: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [quizAccuracy, setQuizAccuracy] = useState(0);
  const [studyTime, setStudyTime] = useState('0.0');
  const [avgStudyTime, setAvgStudyTime] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [improvement, setImprovement] = useState(0);

  useEffect(() => {
    // Load all statistics
    const vocabStats = getVocabularyStats();
    setStats(vocabStats);

    const weekActivity = getWeeklyActivity();
    setWeeklyData(weekActivity);

    const uStats = loadUserStats();
    setUserStats(uStats);

    // Update stats based on timeFilter
    updateStatsForTimeframe(timeFilter);
  }, [vocabulary, timeFilter]);

  const updateStatsForTimeframe = (timeframe) => {
    setQuizAccuracy(calculateQuizAccuracy(timeframe));
    setStudyTime(getTotalStudyTime(timeframe));
    setAvgStudyTime(getAverageStudyTime(timeframe));
    setImprovement(calculateImprovement(timeframe));

    if (timeframe === 'week') {
      setWordsLearned(getWordsLearnedThisWeek());
    } else {
      // For month/all, use total from vocab stats
      setWordsLearned(stats.mastered);
    }
  };

  const getRecentWords = () => {
    return getRecentlyStudiedWords(4);
  };

  const totalWords = stats.total;
  const maxValue = Math.max(...weeklyData.map(d => d.value), 1);

  return (
    <div className="progress">
      <div className="progress-header">
        <div className="header-left">
          <h1>Your Progress</h1>
          <p className="subtitle">Track your IELTS vocabulary mastery</p>
        </div>
        <div className="time-filters">
          <button
            className={`time-chip ${timeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setTimeFilter('week')}
          >
            This Week
          </button>
          <button
            className={`time-chip ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('month')}
          >
            This Month
          </button>
          <button
            className={`time-chip ${timeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <span className="stat-label">Words Learned</span>
          <span className="stat-value">{wordsLearned}</span>
          <span className="stat-change positive">
            {timeFilter === 'week' ? 'this week' : timeFilter === 'month' ? 'this month' : 'all time'}
          </span>
        </div>

        <div className="stat-card card">
          <span className="stat-label">Quiz Accuracy</span>
          <span className="stat-value">{quizAccuracy}%</span>
          <span className="stat-change positive">
            {improvement > 0 ? `+${improvement}%` : improvement < 0 ? `${improvement}%` : 'No change'} improvement
          </span>
        </div>

        <div className="stat-card card">
          <span className="stat-label">Study Streak</span>
          <span className="stat-value red">{userStats?.currentStreak || 0}</span>
          <span className="stat-change muted">days in a row</span>
        </div>

        <div className="stat-card card">
          <span className="stat-label">Time Studied</span>
          <span className="stat-value">{studyTime}h</span>
          <span className="stat-change muted">avg {avgStudyTime}min/day</span>
        </div>
      </div>

      <div className="bottom-section">
        <div className="weekly-chart card">
          <h2>Weekly Activity</h2>
          <div className="chart-area">
            {weeklyData.map((data, index) => (
              <div key={index} className="bar-wrapper">
                <div
                  className={`bar ${data.value === 0 ? 'empty' : ''}`}
                  style={{ height: `${(data.value / maxValue) * 100}%` }}
                ></div>
                <span className="bar-label">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mastery-panel card">
          <h2>Word Mastery</h2>

          <div className="mastery-list">
            <div className="mastery-item">
              <div className="mastery-row">
                <span className="mastery-label">Mastered</span>
                <span className="mastery-value green">{stats.mastered} words</span>
              </div>
              <div className="mastery-bar-bg">
                <div
                  className="mastery-bar-fill green"
                  style={{ width: `${(stats.mastered / totalWords) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mastery-item">
              <div className="mastery-row">
                <span className="mastery-label">Learning</span>
                <span className="mastery-value blue">{stats.learning} words</span>
              </div>
              <div className="mastery-bar-bg">
                <div
                  className="mastery-bar-fill blue"
                  style={{ width: `${(stats.learning / totalWords) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mastery-item">
              <div className="mastery-row">
                <span className="mastery-label">Struggling</span>
                <span className="mastery-value amber">{stats.struggling} words</span>
              </div>
              <div className="mastery-bar-bg">
                <div
                  className="mastery-bar-fill amber"
                  style={{ width: `${(stats.struggling / totalWords) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mastery-item">
              <div className="mastery-row">
                <span className="mastery-label">Not Started</span>
                <span className="mastery-value muted">{stats.notStarted} words</span>
              </div>
              <div className="mastery-bar-bg">
                <div
                  className="mastery-bar-fill muted"
                  style={{ width: `${(stats.notStarted / totalWords) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <h3>Recently Studied</h3>

          <div className="recent-list">
            {getRecentWords().map(word => (
              <div key={word.id} className="recent-item">
                <span className="recent-word">{word.word}</span>
                <span className={`recent-status ${word.status}`}>
                  {word.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
