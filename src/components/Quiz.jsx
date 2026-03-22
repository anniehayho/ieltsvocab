import { useState, useEffect } from 'react';
import './Quiz.css';
import { incrementReviewCount, updateWordStatus } from '../data/vocabularyData';

const Quiz = ({ vocabulary, refreshVocabulary }) => {
  const [quizWords, setQuizWords] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    startNewQuiz();
    // Start timer
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [vocabulary]);

  const startNewQuiz = () => {
    if (vocabulary.length < 4) return;

    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, vocabulary.length));

    const questions = selected.map(word => {
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
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
          <h1>Quiz Practice</h1>
          <p className="header-subtitle">Multiple Choice — Academic Vocabulary</p>
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

        <div className="quiz-bottom">
          {hasAnswered && currentQuestion < quizWords.length - 1 && (
            <button className="next-question-btn" onClick={handleNext}>
              <span>Next Question</span>
              <svg className="icon-sm" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
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
