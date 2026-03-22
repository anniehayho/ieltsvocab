import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import Home from './components/Home';
import Browse from './components/Browse';
import Study from './components/Study';
import Quiz from './components/Quiz';
import Progress from './components/Progress';
import { initializeVocabulary } from './data/vocabularyData';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [vocabulary, setVocabulary] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Initialize vocabulary from localStorage
    const vocab = initializeVocabulary();
    setVocabulary(vocab);

    // Load streak from localStorage
    const savedStreak = localStorage.getItem('streak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    } else {
      localStorage.setItem('streak', '7');
      setStreak(7);
    }
  }, []);

  const refreshVocabulary = () => {
    const vocab = JSON.parse(localStorage.getItem('vocabulary')) || [];
    setVocabulary(vocab);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home vocabulary={vocabulary} streak={streak} />;
      case 'browse':
        return <Browse vocabulary={vocabulary} refreshVocabulary={refreshVocabulary} />;
      case 'study':
        return <Study vocabulary={vocabulary} refreshVocabulary={refreshVocabulary} />;
      case 'quiz':
        return <Quiz vocabulary={vocabulary} refreshVocabulary={refreshVocabulary} />;
      case 'progress':
        return <Progress vocabulary={vocabulary} />;
      default:
        return <Home vocabulary={vocabulary} streak={streak} />;
    }
  };

  return (
    <div className="app">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {renderView()}
      </main>
      <TabBar currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default App;
