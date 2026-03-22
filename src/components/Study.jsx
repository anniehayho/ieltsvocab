import { useState, useEffect } from 'react';
import './Study.css';
import { updateWordStatus, incrementReviewCount } from '../data/vocabularyData';

const Study = ({ vocabulary, refreshVocabulary }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyWords, setStudyWords] = useState([]);
  const [studied, setStudied] = useState(0);

  useEffect(() => {
    // Get all words for study session
    const wordsToStudy = [...vocabulary].slice(0, 40);
    setStudyWords(wordsToStudy);
    setStudied(0);
    setCurrentIndex(0);
  }, [vocabulary]);

  const currentWord = studyWords[currentIndex];
  const totalWords = studyWords.length;
  const progressPercentage = totalWords > 0 ? (studied / totalWords) * 100 : 0;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (studied > 0) {
        setStudied(studied - 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
      setStudied(Math.max(studied, currentIndex + 1));
      if (currentWord) {
        incrementReviewCount(currentWord.id);
        refreshVocabulary();
      }
    }
  };

  const handleKnewIt = () => {
    if (currentWord) {
      updateWordStatus(currentWord.id, 'mastered');
      incrementReviewCount(currentWord.id);
      refreshVocabulary();
    }
    handleNext();
  };

  const handleStudyAgain = () => {
    if (currentWord) {
      updateWordStatus(currentWord.id, 'learning');
      incrementReviewCount(currentWord.id);
      refreshVocabulary();
    }
    handleNext();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, studied]);

  if (!currentWord) {
    return (
      <div className="study">
        <div className="empty-state">
          <p>No words available to study.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="study">
      <div className="study-header">
        <div className="header-left">
          <h1>Flashcard Study</h1>
          <p className="header-subtitle">
            {currentWord.category} Vocabulary — Band {currentWord.bandLevel}
          </p>
        </div>
        <div className="header-right">
          <span className="progress-label">
            {studied} / {totalWords} words
          </span>
          <div className="progress-bar-header">
            <div
              className="progress-fill-header"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="card-area">
        <div className="flashcard-static">
          <h2 className="word-label">{currentWord.word}</h2>
          <p className="phonetic">{currentWord.pronunciation}</p>
          <div className="part-of-speech-badge">
            <span>{currentWord.partOfSpeech}</span>
          </div>
          <div className="divider-line"></div>
          <p className="definition-text">{currentWord.definition}</p>
          <p className="example-text">"{currentWord.example}"</p>
        </div>

        <div className="controls">
          <button className="control-btn btn-prev" onClick={handlePrevious} disabled={currentIndex === 0}>
            <svg className="icon icon-sm" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Previous</span>
          </button>

          <button className="control-btn btn-knew-it" onClick={handleKnewIt}>
            <svg className="icon icon-sm" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>I Knew It</span>
          </button>

          <button className="control-btn btn-study-again" onClick={handleStudyAgain}>
            <svg className="icon icon-sm" viewBox="0 0 24 24">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Study Again</span>
          </button>

          <button className="control-btn btn-next" onClick={handleNext} disabled={currentIndex === totalWords - 1}>
            <span>Next</span>
            <svg className="icon icon-sm" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="shortcuts">
          <div className="shortcut">
            <kbd>←</kbd>
            <span>Previous</span>
          </div>
          <div className="shortcut">
            <kbd>→</kbd>
            <span>Next</span>
          </div>
          <div className="shortcut">
            <kbd>Space</kbd>
            <span>Flip Card</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;
