import { useState, useEffect } from 'react';
import './Home.css';

const Home = ({ vocabulary, streak }) => {
  const [wordOfTheDay, setWordOfTheDay] = useState(null);

  useEffect(() => {
    if (vocabulary.length > 0) {
      // Select a random word as word of the day
      const randomIndex = Math.floor(Math.random() * vocabulary.length);
      setWordOfTheDay(vocabulary[randomIndex]);
    }
  }, [vocabulary]);

  const getStatusCount = (status) => {
    return vocabulary.filter(word => word.status === status).length;
  };

  const getRecentActivity = () => {
    return vocabulary
      .sort((a, b) => new Date(b.lastReviewed) - new Date(a.lastReviewed))
      .slice(0, 3);
  };

  return (
    <div className="home">
      <div className="home-header">
        <div className="header-left">
          <h1 className="greeting">Welcome back!</h1>
          <p className="subgreeting">Ready to expand your vocabulary?</p>
        </div>
        <div className="streak-badge">
          <svg className="icon icon-sm" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
          </svg>
          <span>{streak} day streak</span>
        </div>
      </div>

      {wordOfTheDay && (
        <div className="word-of-day card">
          <div className="wotd-header">
            <h2>Word of the Day</h2>
            <span className="band-badge">{wordOfTheDay.bandLevel}</span>
          </div>
          <div className="wotd-content">
            <div className="word-title">
              <h3>{wordOfTheDay.word}</h3>
              <span className="pronunciation">{wordOfTheDay.pronunciation}</span>
            </div>
            <p className="part-of-speech">{wordOfTheDay.partOfSpeech}</p>
            <p className="definition">{wordOfTheDay.definition}</p>
            <p className="example">"{wordOfTheDay.example}"</p>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <div className="action-card card">
          <h3>📚 Browse</h3>
          <p>Explore {vocabulary.length} words</p>
        </div>
        <div className="action-card card">
          <h3>🎯 Study</h3>
          <p>Review with flashcards</p>
        </div>
        <div className="action-card card">
          <h3>✏️ Quiz</h3>
          <p>Test your knowledge</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list card">
          {getRecentActivity().map(word => (
            <div key={word.id} className="activity-item">
              <div className="activity-word">
                <span className="word-name">{word.word}</span>
                <span className={`status-badge ${word.status}`}>
                  {word.status}
                </span>
              </div>
              <span className="review-count">{word.reviewCount} reviews</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
