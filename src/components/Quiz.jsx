import { useState, useEffect, useRef } from 'react';
import './Quiz.css';
import { incrementReviewCount, updateWordStatus, saveQuizResult } from '../data/hybridDataService';

const Quiz = ({ vocabulary, refreshVocabulary }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [isQuizzing, setIsQuizzing] = useState(false);
  const [quizWords, setQuizWords] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerIntervalRef = useRef(null);

  // Generate 20 pre-defined quizzes
  const generateQuizzes = () => {
    if (vocabulary.length < 10) return [];

    const quizzes = [];
    const wordsPerQuiz = 10;

    for (let i = 0; i < 20; i++) {
      const startIndex = (i * wordsPerQuiz) % vocabulary.length;
      let quizVocab = [];

      // Select 10 words for this quiz
      for (let j = 0; j < wordsPerQuiz; j++) {
        const index = (startIndex + j) % vocabulary.length;
        quizVocab.push(vocabulary[index]);
      }

      // Calculate stats
      const totalWords = quizVocab.length;
      const masteredWords = quizVocab.filter(w => w.status === 'mastered').length;
      const completionPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

      quizzes.push({
        id: i + 1,
        title: `Quiz ${i + 1}`,
        words: quizVocab,
        totalWords,
        completionPercentage
      });
    }

    return quizzes;
  };

  const quizzes = generateQuizzes();

  const handleStartQuiz = () => {
    if (!selectedQuiz && !shuffle) return;

    let wordsToQuiz = [];

    if (shuffle) {
      // Generate random quiz
      const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
      wordsToQuiz = shuffled.slice(0, 10);
    } else {
      // Use selected quiz
      wordsToQuiz = selectedQuiz.words;
    }

    // Create questions with multiple choice options
    const questions = wordsToQuiz.map(word => {
      const wrongOptions = vocabulary
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.definition);

      const options = [word.definition, ...wrongOptions]
        .sort(() => Math.random() - 0.5);

      return {
        ...word,
        options,
        correctAnswer: word.definition
      };
    });

    setQuizWords(questions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setTimer(0);
    setQuizCompleted(false);
    setIsQuizzing(true);

    // Start timer
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const handleBackToSelection = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsQuizzing(false);
    setQuizCompleted(false);
    setSelectedQuiz(null);
    setQuizWords([]);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
  };

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer) return;

    const currentWord = quizWords[currentQuestion];
    const isCorrect = answer === currentWord.correctAnswer;

    setSelectedAnswer(answer);

    if (isCorrect) {
      setScore(score + 1);
      updateWordStatus(currentWord.id, 'mastered');
    } else {
      updateWordStatus(currentWord.id, 'struggling');
    }

    incrementReviewCount(currentWord.id);
    refreshVocabulary();

    setAnswers([...answers, { isCorrect }]);
  };

  const handleNext = () => {
    if (currentQuestion < quizWords.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const wordsQuizzed = quizWords.map(w => w.id);
      const totalQuestions = quizWords.length;

      saveQuizResult(score, totalQuestions, duration, wordsQuizzed);
      setQuizCompleted(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Show quiz selection screen
  if (!isQuizzing) {
    return (
      <div className="quiz">
        <div className="quiz-header">
          <div className="header-left">
            <h1>Quiz Practice</h1>
            <p className="header-subtitle">Choose a quiz to test your knowledge</p>
          </div>
        </div>

        <div className="quiz-selection">
          <div className="selection-controls">
            <div className="shuffle-toggle">
              <input
                type="checkbox"
                id="shuffle-quiz"
                checked={shuffle}
                onChange={(e) => {
                  setShuffle(e.target.checked);
                  if (e.target.checked) {
                    setSelectedQuiz(null);
                  }
                }}
              />
              <label htmlFor="shuffle-quiz">
                <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
                Random quiz (unlimited)
              </label>
            </div>
          </div>

          {!shuffle && (
            <div className="quizzes-grid">
              {quizzes.map(quiz => (
                <div
                  key={quiz.id}
                  className={`quiz-card ${selectedQuiz?.id === quiz.id ? 'selected' : ''}`}
                  onClick={() => setSelectedQuiz(quiz)}
                >
                  <div className="quiz-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 11l3 3L22 4"></path>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                    </svg>
                  </div>
                  <div className="quiz-info">
                    <h3>{quiz.title}</h3>
                    <p className="quiz-stats">
                      {quiz.totalWords} questions
                      {quiz.completionPercentage > 0 && (
                        <span className="completion-badge">{quiz.completionPercentage}% completed</span>
                      )}
                    </p>
                  </div>
                  {selectedQuiz?.id === quiz.id && (
                    <div className="check-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {shuffle && (
            <div className="shuffle-message">
              <svg className="shuffle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
              <h3>Random Quiz Mode</h3>
              <p>Get 10 random questions from the entire vocabulary database</p>
            </div>
          )}

          <div className="start-quiz-section">
            <button
              className="btn-start-quiz"
              onClick={handleStartQuiz}
              disabled={!selectedQuiz && !shuffle}
            >
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start Quiz (10 questions)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (quizCompleted) {
    const accuracy = Math.round((score / quizWords.length) * 100);
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = answers.filter(a => !a.isCorrect).length;

    return (
      <div className="quiz">
        <div className="completion-screen">
          <div className="completion-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1>Quiz Complete!</h1>
          <p className="completion-subtitle">
            {shuffle ? 'Random Quiz' : selectedQuiz?.title} — Great effort!
          </p>

          <div className="session-stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{correctAnswers}</div>
                <div className="stat-label">Correct</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{incorrectAnswers}</div>
                <div className="stat-label">Incorrect</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{quizWords.length}</div>
                <div className="stat-label">Total Questions</div>
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
                <div className="stat-value">{formatTime(timer)}</div>
                <div className="stat-label">Time Taken</div>
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
            <button className="btn-finish" onClick={handleBackToSelection}>
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Finish & Choose New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz questions
  if (quizWords.length === 0) {
    return (
      <div className="quiz">
        <div className="empty-state">
          <p>Not enough words to create a quiz. Add more vocabulary!</p>
        </div>
      </div>
    );
  }

  const currentWord = quizWords[currentQuestion];
  const hasAnswered = selectedAnswer !== null;

  return (
    <div className="quiz">
      <div className="quiz-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBackToSelection}>
            <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Quizzes
          </button>
          <div>
            <h1>Quiz Practice</h1>
            <p className="header-subtitle">
              {shuffle ? 'Random Quiz' : selectedQuiz?.title}
            </p>
          </div>
        </div>
        <div className="header-right">
          <span className="score-label">{score}/{quizWords.length}</span>
          <div className="timer-badge">
            <svg className="icon-sm" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(timer)}</span>
          </div>
        </div>
      </div>

      <div className="quiz-area">
        <div className="question-card">
          <span className="question-number">Question {currentQuestion + 1} of {quizWords.length}</span>
          <h2 className="question-text">What does "{currentWord.word}" mean?</h2>
          <p className="question-context">"{currentWord.example}"</p>
        </div>

        <div className="options-list">
          {currentWord.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentWord.correctAnswer;
            const showCorrect = hasAnswered && isCorrect;
            const showIncorrect = hasAnswered && isSelected && !isCorrect;
            const letter = String.fromCharCode(65 + index);

            return (
              <button
                key={index}
                className={`quiz-option ${showCorrect ? 'correct' : ''} ${showIncorrect ? 'incorrect' : ''}`}
                onClick={() => handleAnswerSelect(option)}
                disabled={hasAnswered}
              >
                <div className={`option-letter ${showCorrect ? 'correct' : ''}`}>
                  {letter}
                </div>
                <span className={`option-text ${showCorrect ? 'bold' : ''}`}>{option}</span>
                {showCorrect && (
                  <svg className="check-icon" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className={`answer-feedback ${selectedAnswer === currentWord.correctAnswer ? 'correct' : 'incorrect'}`}>
            {selectedAnswer === currentWord.correctAnswer ? (
              <>
                <svg className="feedback-icon" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div className="feedback-text">
                  <strong>Correct!</strong>
                  <span>Great job! You got it right.</span>
                </div>
              </>
            ) : (
              <>
                <svg className="feedback-icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <div className="feedback-text">
                  <strong>Incorrect</strong>
                  <span>The correct answer is: {currentWord.correctAnswer}</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="quiz-bottom">
          {hasAnswered && (
            <button className="next-question-btn" onClick={handleNext}>
              <span>{currentQuestion < quizWords.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
              <svg className="icon-sm" viewBox="0 0 24 24">
                {currentQuestion < quizWords.length - 1 ? (
                  <>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </>
                ) : (
                  <polyline points="20 6 9 17 4 12" />
                )}
              </svg>
            </button>
          )}

          <div className="progress-dots">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`dot ${answer.isCorrect ? 'correct' : 'incorrect'}`}
              ></div>
            ))}
            {Array.from({ length: quizWords.length - answers.length }).map((_, index) => (
              <div key={`remaining-${index}`} className="dot remaining"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
