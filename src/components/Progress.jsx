import { useState } from 'react';
import './Progress.css';

const Progress = ({ vocabulary }) => {
  const [timeFilter, setTimeFilter] = useState('week');

  const getStatsByStatus = () => {
    const mastered = vocabulary.filter(w => w.status === 'mastered').length;
    const learning = vocabulary.filter(w => w.status === 'learning').length;
    const struggling = vocabulary.filter(w => w.status === 'struggling').length;
    const notStarted = vocabulary.length - mastered - learning - struggling;

    return { mastered, learning, struggling, notStarted };
  };

  const getTotalReviews = () => {
    return vocabulary.reduce((sum, word) => sum + word.reviewCount, 0);
  };

  const getRecentWords = () => {
    return [...vocabulary]
      .sort((a, b) => new Date(b.lastReviewed) - new Date(a.lastReviewed))
      .slice(0, 4);
  };

  const stats = getStatsByStatus();
  const totalWords = vocabulary.length;

  // Mock weekly data (in real app, calculate from actual study sessions)
  const weeklyData = [
    { day: 'Mon', value: 60 },
    { day: 'Tue', value: 120 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 150 },
    { day: 'Fri', value: 100 },
    { day: 'Sat', value: 180 },
    { day: 'Sun', value: 0 } // Today - not completed
  ];

  const maxValue = Math.max(...weeklyData.map(d => d.value));

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
          <span className="stat-value">{stats.mastered}</span>
          <span className="stat-change positive">+32 this week</span>
        </div>

        <div className="stat-card card">
          <span className="stat-label">Quiz Accuracy</span>
          <span className="stat-value">87%</span>
          <span className="stat-change positive">+5% improvement</span>
        </div>

        <div className="stat-card card">
          <span className="stat-label">Study Streak</span>
          <span className="stat-value red">14</span>
          <span className="stat-change muted">days in a row</span>
        </div>

        <div className="stat-card card">
          <span className="stat-label">Time Studied</span>
          <span className="stat-value">6.2h</span>
          <span className="stat-change muted">avg 53min/day</span>
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
