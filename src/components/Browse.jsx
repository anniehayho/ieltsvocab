import { useState } from 'react';
import './Browse.css';

const Browse = ({ vocabulary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'Academic', label: 'Academic' },
    { id: 'General', label: 'General Training' },
    { id: '5-6', label: 'Band 5-6' },
    { id: '7-8', label: 'Band 7-8' },
    { id: '9', label: 'Band 9' },
    { id: 'mastered', label: 'Mastered' },
    { id: 'learning', label: 'Learning' },
    { id: 'struggling', label: 'Struggling' }
  ];

  // Album/Category data
  const albums = [
    {
      id: 1,
      title: 'Academic Words',
      totalWords: 320,
      category: 'Academic',
      learnedPercentage: 45
    },
    {
      id: 2,
      title: 'General Training',
      totalWords: 280,
      category: 'General',
      learnedPercentage: 62
    },
    {
      id: 3,
      title: 'Band 5-6 Essentials',
      totalWords: 450,
      bandLevel: '5-6',
      learnedPercentage: 78
    },
    {
      id: 4,
      title: 'Band 7-8 Advanced',
      totalWords: 380,
      bandLevel: '7-8',
      learnedPercentage: 35
    },
    {
      id: 5,
      title: 'Band 9 Expert',
      totalWords: 220,
      bandLevel: '9',
      learnedPercentage: 18
    },
    {
      id: 6,
      title: 'Speaking & Writing',
      totalWords: 190,
      category: 'General',
      learnedPercentage: 55
    }
  ];

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;

    if (['Academic', 'General'].includes(activeFilter)) {
      return matchesSearch && album.category === activeFilter;
    }

    if (['5-6', '7-8', '9'].includes(activeFilter)) {
      return matchesSearch && album.bandLevel === activeFilter;
    }

    return matchesSearch;
  });

  const totalWords = albums.reduce((sum, album) => sum + album.totalWords, 0);

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
  };

  // Get words for selected album
  const getAlbumWords = (album) => {
    if (!album) return [];

    let filtered = vocabulary;

    if (album.category) {
      filtered = vocabulary.filter(w => w.category === album.category);
    } else if (album.bandLevel) {
      filtered = vocabulary.filter(w => w.bandLevel === album.bandLevel);
    }

    return filtered;
  };

  const albumWords = selectedAlbum ? getAlbumWords(selectedAlbum) : [];
  const [wordSearchTerm, setWordSearchTerm] = useState('');

  const filteredWords = albumWords.filter(word =>
    word.word.toLowerCase().includes(wordSearchTerm.toLowerCase()) ||
    word.definition.toLowerCase().includes(wordSearchTerm.toLowerCase())
  );

  // If an album is selected, show the word list
  if (selectedAlbum) {
    return (
      <div className="browse">
        <div className="browse-header">
          <div className="header-title">
            <div className="title-with-back">
              <button className="back-button" onClick={handleBackToAlbums}>
                <svg className="icon icon-sm" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
              <h1>{selectedAlbum.title}</h1>
            </div>
            <span className="word-count">{albumWords.length} words</span>
          </div>

          <div className="search-bar">
            <svg className="icon icon-sm search-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search words in this collection..."
              value={wordSearchTerm}
              onChange={(e) => setWordSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="word-list">
          {filteredWords.map(word => (
            <div key={word.id} className="word-list-item card">
              <div className="word-header">
                <div className="word-main">
                  <h3 className="word-title">{word.word}</h3>
                  <span className="word-pronunciation">{word.pronunciation}</span>
                </div>
                <span className={`status-badge ${word.status}`}>
                  {word.status}
                </span>
              </div>
              <p className="word-pos">{word.partOfSpeech}</p>
              <p className="word-definition">{word.definition}</p>
              <p className="word-example">"{word.example}"</p>
              <div className="word-meta">
                <span className="category-badge">{word.category}</span>
                <span className="band-badge">{word.bandLevel}</span>
                {word.synonyms && word.synonyms.length > 0 && (
                  <span className="synonyms-badge">
                    Synonyms: {word.synonyms.join(', ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div className="empty-state">
            <p>No words found matching your search.</p>
          </div>
        )}
      </div>
    );
  }

  // Default album grid view
  return (
    <div className="browse">
      <div className="browse-header">
        <div className="header-title">
          <h1>Browse Vocabulary</h1>
          <span className="word-count">{totalWords.toLocaleString()} words</span>
        </div>

        <div className="search-bar">
          <svg className="icon icon-sm search-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search words, definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-row">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`chip ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="album-grid">
        {filteredAlbums.map(album => (
          <div
            key={album.id}
            className="album-card card"
            onClick={() => handleAlbumClick(album)}
          >
            <h3 className="album-title">{album.title}</h3>
            <p className="album-count">{album.totalWords} words</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${album.learnedPercentage}%` }}
              ></div>
            </div>
            <p className="progress-text">{album.learnedPercentage}% learned</p>
          </div>
        ))}
      </div>

      {filteredAlbums.length === 0 && (
        <div className="empty-state">
          <p>No collections found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Browse;
