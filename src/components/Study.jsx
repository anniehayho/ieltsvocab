import { useState, useEffect, useRef } from 'react';
import './Study.css';
import { updateWordStatus, incrementReviewCount, saveStudySession } from '../data/hybridDataService';

const Study = ({ vocabulary, refreshVocabulary }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyWords, setStudyWords] = useState([]);
  const [studied, setStudied] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [includeLearnedWords, setIncludeLearnedWords] = useState(true);
  const [isStudying, setIsStudying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ knew: 0, studyAgain: 0 });
  const startTimeRef = useRef(Date.now());
  const studiedWordsRef = useRef(new Set());
  const lastSaveTimeRef = useRef(Date.now());

  // Get album data (same as Browse screen)
  const getAlbumData = (category, bandLevel) => {
    let filteredWords = [];

    if (category) {
      filteredWords = vocabulary.filter(w => w.category === category);
    } else if (bandLevel) {
      if (bandLevel === '6.0') {
        filteredWords = vocabulary.filter(w => w.bandLevel === '6.0' || w.bandLevel === '6.5');
      } else if (bandLevel === '7.0') {
        filteredWords = vocabulary.filter(w => w.bandLevel === '7.0' || w.bandLevel === '7.5');
      } else if (bandLevel === '8.0') {
        filteredWords = vocabulary.filter(w => w.bandLevel === '8.0' || w.bandLevel === '8.5');
      } else if (bandLevel === '9.0') {
        filteredWords = vocabulary.filter(w => w.bandLevel === '9.0');
      }
    } else {
      filteredWords = vocabulary;
    }

    const totalWords = filteredWords.length;
    const learnedWords = filteredWords.filter(w => w.status === 'mastered').length;
    const learnedPercentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

    return { totalWords, learnedPercentage };
  };

  // Define albums (same as Browse screen)
  const albums = [
    {
      id: 1,
      title: 'Education & Learning',
      category: 'Education & Learning',
      ...getAlbumData('Education & Learning')
    },
    {
      id: 2,
      title: 'Environment & Climate',
      category: 'Environment & Climate',
      ...getAlbumData('Environment & Climate')
    },
    {
      id: 3,
      title: 'Technology & Digital Life',
      category: 'Technology & Digital Life',
      ...getAlbumData('Technology & Digital Life')
    },
    {
      id: 4,
      title: 'Health & Lifestyle',
      category: 'Health & Lifestyle',
      ...getAlbumData('Health & Lifestyle')
    },
    {
      id: 5,
      title: 'Work & Business',
      category: 'Work & Business',
      ...getAlbumData('Work & Business')
    },
    {
      id: 6,
      title: 'Society & Community',
      category: 'Society & Community',
      ...getAlbumData('Society & Community')
    },
    {
      id: 7,
      title: 'Travel & Globalization',
      category: 'Travel & Globalization',
      ...getAlbumData('Travel & Globalization')
    },
    {
      id: 8,
      title: 'Science & Innovation',
      category: 'Science & Innovation',
      ...getAlbumData('Science & Innovation')
    },
    {
      id: 9,
      title: 'Media & Communication',
      category: 'Media & Communication',
      ...getAlbumData('Media & Communication')
    },
    {
      id: 10,
      title: 'Urban Development',
      category: 'Urban Development',
      ...getAlbumData('Urban Development')
    },
    {
      id: 11,
      title: 'Band 6.0-6.5 (Basic)',
      bandLevel: '6.0',
      ...getAlbumData(null, '6.0')
    },
    {
      id: 12,
      title: 'Band 7.0-7.5 (Intermediate)',
      bandLevel: '7.0',
      ...getAlbumData(null, '7.0')
    },
    {
      id: 13,
      title: 'Band 8.0-8.5 (Advanced)',
      bandLevel: '8.0',
      ...getAlbumData(null, '8.0')
    },
    {
      id: 14,
      title: 'Band 9.0 (Expert)',
      bandLevel: '9.0',
      ...getAlbumData(null, '9.0')
    },
    {
      id: 15,
      title: 'All Words',
      category: null,
      bandLevel: null,
      ...getAlbumData(null, null)
    }
  ];

  const getAlbumWords = (album) => {
    if (!album) return [];

    if (album.category) {
      return vocabulary.filter(w => w.category === album.category);
    } else if (album.bandLevel) {
      if (album.bandLevel === '6.0') {
        return vocabulary.filter(w => w.bandLevel === '6.0' || w.bandLevel === '6.5');
      } else if (album.bandLevel === '7.0') {
        return vocabulary.filter(w => w.bandLevel === '7.0' || w.bandLevel === '7.5');
      } else if (album.bandLevel === '8.0') {
        return vocabulary.filter(w => w.bandLevel === '8.0' || w.bandLevel === '8.5');
      } else if (album.bandLevel === '9.0') {
        return vocabulary.filter(w => w.bandLevel === '9.0');
      }
    }

    return vocabulary;
  };

  const handleStartStudy = () => {
    if (!selectedAlbum) return;

    let wordsToStudy = getAlbumWords(selectedAlbum);

    // Filter out learned words if not including them
    if (!includeLearnedWords) {
      wordsToStudy = wordsToStudy.filter(w => w.status !== 'mastered');
    }

    // Shuffle if enabled
    if (shuffle) {
      wordsToStudy = [...wordsToStudy].sort(() => Math.random() - 0.5);
    }

    // Limit to 40 words per session
    wordsToStudy = wordsToStudy.slice(0, 40);

    setStudyWords(wordsToStudy);
    setStudied(0);
    setCurrentIndex(0);
    setIsStudying(true);
    setIsCompleted(false);
    setSessionStats({ knew: 0, studyAgain: 0 });
    startTimeRef.current = Date.now();
    lastSaveTimeRef.current = Date.now();
    studiedWordsRef.current = new Set();
  };

  const handleBackToSelection = () => {
    setIsStudying(false);
    setIsCompleted(false);
    setSelectedAlbum(null);
    setStudyWords([]);
    setCurrentIndex(0);
    setStudied(0);
    setSessionStats({ knew: 0, studyAgain: 0 });
  };

  const handleFinishSession = () => {
    // Save final study session
    const duration = Math.floor((Date.now() - lastSaveTimeRef.current) / 1000);
    const wordsStudied = studiedWordsRef.current.size;
    if (duration > 0) {
      saveStudySession(wordsStudied, duration);
    }

    // Return to album selection
    handleBackToSelection();
  };

  useEffect(() => {
    // Update study time display every second
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setStudyTime(elapsed);
    }, 1000);

    // Periodically save study time every 30 seconds
    const saveInterval = setInterval(() => {
      const duration = Math.floor((Date.now() - lastSaveTimeRef.current) / 1000);
      const wordsStudied = studiedWordsRef.current.size;

      if (duration > 0) {
        // Save incremental time since last save
        saveStudySession(wordsStudied, duration);
        lastSaveTimeRef.current = Date.now();
      }
    }, 30000); // Save every 30 seconds

    // Save study session when component unmounts
    return () => {
      clearInterval(timerInterval);
      clearInterval(saveInterval);

      const duration = Math.floor((Date.now() - lastSaveTimeRef.current) / 1000);
      const wordsStudied = studiedWordsRef.current.size;
      if (duration > 0) {
        saveStudySession(wordsStudied, duration);
      }
    };
  }, []);

  const currentWord = studyWords[currentIndex];
  const totalWords = studyWords.length;
  const progressPercentage = totalWords > 0 ? (studied / totalWords) * 100 : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
      setStudied(Math.max(studied, currentIndex + 2));
    }
  };

  const handleKnewIt = () => {
    if (currentWord) {
      updateWordStatus(currentWord.id, 'mastered');
      incrementReviewCount(currentWord.id);
      studiedWordsRef.current.add(currentWord.id);
      setSessionStats(prev => ({ ...prev, knew: prev.knew + 1 }));
      // Refresh vocabulary in parent to update Progress stats
      refreshVocabulary();
    }
    // Move to next word or complete session
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
      setStudied(Math.max(studied, currentIndex + 2));
    } else {
      // Session completed
      setIsCompleted(true);
    }
  };

  const handleStudyAgain = () => {
    if (currentWord) {
      updateWordStatus(currentWord.id, 'learning');
      incrementReviewCount(currentWord.id);
      studiedWordsRef.current.add(currentWord.id);
      setSessionStats(prev => ({ ...prev, studyAgain: prev.studyAgain + 1 }));
      // Refresh vocabulary in parent to update Progress stats
      refreshVocabulary();
    }
    // Move to next word or complete session
    if (currentIndex < totalWords - 1) {
      setCurrentIndex(currentIndex + 1);
      setStudied(Math.max(studied, currentIndex + 2));
    } else {
      // Session completed
      setIsCompleted(true);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setStudied(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' && currentIndex < totalWords - 1) {
        setCurrentIndex(prev => prev + 1);
        setStudied(prev => Math.max(prev, currentIndex + 2));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, totalWords]);

  // Show album selection screen
  if (!isStudying) {
    return (
      <div className="study">
        <div className="study-header">
          <div className="header-left">
            <h1>Flashcard Study</h1>
            <p className="header-subtitle">Choose an album to study</p>
          </div>
        </div>

        <div className="album-selection">
          <div className="selection-controls">
            <div className="shuffle-toggle">
              <input
                type="checkbox"
                id="shuffle"
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
              />
              <label htmlFor="shuffle">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
                Shuffle cards
              </label>
            </div>
            <div className="shuffle-toggle">
              <input
                type="checkbox"
                id="includeLearnedWords"
                checked={includeLearnedWords}
                onChange={(e) => setIncludeLearnedWords(e.target.checked)}
              />
              <label htmlFor="includeLearnedWords">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  <polyline points="9 10 9 17"></polyline>
                  <polyline points="15 10 15 17"></polyline>
                </svg>
                Include learned words
              </label>
            </div>
          </div>

          <div className="albums-grid">
            {albums.map(album => (
              <div
                key={album.id}
                className={`album-card ${selectedAlbum?.id === album.id ? 'selected' : ''}`}
                onClick={() => setSelectedAlbum(album)}
              >
                <div className="album-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <div className="album-info">
                  <h3>{album.title}</h3>
                  <p className="album-stats">
                    {album.totalWords} words
                    {album.learnedPercentage > 0 && (
                      <span className="learned-badge">{album.learnedPercentage}% learned</span>
                    )}
                  </p>
                </div>
                {selectedAlbum?.id === album.id && (
                  <div className="check-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="start-study-section">
            <button
              className="btn-start-study"
              onClick={handleStartStudy}
              disabled={!selectedAlbum}
            >
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start Studying {selectedAlbum && `(${Math.min(getAlbumWords(selectedAlbum).length, 40)} cards)`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (isCompleted) {
    const totalCards = studyWords.length;
    const accuracy = totalCards > 0 ? Math.round((sessionStats.knew / totalCards) * 100) : 0;

    return (
      <div className="study">
        <div className="completion-screen">
          <div className="completion-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1>Study Session Complete!</h1>
          <p className="completion-subtitle">Great job! You've finished studying {selectedAlbum?.title}</p>

          <div className="session-stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{sessionStats.knew}</div>
                <div className="stat-label">I Knew It</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{sessionStats.studyAgain}</div>
                <div className="stat-label">Study Again</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalCards}</div>
                <div className="stat-label">Total Cards</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{formatTime(studyTime)}</div>
                <div className="stat-label">Study Time</div>
              </div>
            </div>
          </div>

          <div className="accuracy-bar">
            <div className="accuracy-label">
              <span>Accuracy</span>
              <span className="accuracy-percentage">{accuracy}%</span>
            </div>
            <div className="accuracy-progress">
              <div className="accuracy-fill" style={{ width: `${accuracy}%` }}></div>
            </div>
          </div>

          <div className="completion-actions">
            <button className="btn-finish" onClick={handleFinishSession}>
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Finish & Choose New Album
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <button className="btn-back" onClick={handleBackToSelection}>
            <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Albums
          </button>
          <div>
            <h1>Flashcard Study</h1>
            <p className="header-subtitle">
              {selectedAlbum?.title} {shuffle && '(Shuffled)'}
            </p>
          </div>
        </div>
        <div className="header-right">
          <div className="timer-badge">
            <svg className="icon-sm" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(studyTime)}</span>
          </div>
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
