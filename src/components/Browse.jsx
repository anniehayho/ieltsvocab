import { useState } from 'react';
import './Browse.css';

const Browse = ({ vocabulary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [wordSearchTerm, setWordSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 8;

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

  // Calculate real album data from vocabulary
  const getAlbumData = (category = null, bandLevel = null) => {
    let words = vocabulary;

    if (category) {
      words = vocabulary.filter(w => w.category === category);
    } else if (bandLevel) {
      words = vocabulary.filter(w => w.bandLevel === bandLevel);
    }

    const totalWords = words.length;
    const masteredWords = words.filter(w => w.status === 'mastered').length;
    const learnedPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

    return { totalWords, learnedPercentage };
  };

  const academicData = getAlbumData('Academic');
  const generalData = getAlbumData('General');
  const band56Data = getAlbumData(null, '5-6');
  const band78Data = getAlbumData(null, '7-8');

  // Album/Category data with real statistics
  const albums = [
    {
      id: 1,
      title: 'Academic Words',
      totalWords: academicData.totalWords,
      category: 'Academic',
      learnedPercentage: academicData.learnedPercentage
    },
    {
      id: 2,
      title: 'General Training',
      totalWords: generalData.totalWords,
      category: 'General',
      learnedPercentage: generalData.learnedPercentage
    },
    {
      id: 3,
      title: 'Band 5-6 Essentials',
      totalWords: band56Data.totalWords,
      bandLevel: '5-6',
      learnedPercentage: band56Data.learnedPercentage
    },
    {
      id: 4,
      title: 'Band 7-8 Advanced',
      totalWords: band78Data.totalWords,
      bandLevel: '7-8',
      learnedPercentage: band78Data.learnedPercentage
    },
    {
      id: 5,
      title: 'All Words',
      totalWords: vocabulary.length,
      category: null,
      bandLevel: null,
      learnedPercentage: vocabulary.length > 0
        ? Math.round((vocabulary.filter(w => w.status === 'mastered').length / vocabulary.length) * 100)
        : 0
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
    setCurrentPage(1);
    setWordSearchTerm('');
    setStatusFilter('all');
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setCurrentPage(1);
  };

  // Get words for selected album
  const getAlbumWords = (album) => {
    if (!album) return [];

    if (album.category) {
      return vocabulary.filter(w => w.category === album.category);
    } else if (album.bandLevel) {
      return vocabulary.filter(w => w.bandLevel === album.bandLevel);
    }

    // "All Words" album
    return vocabulary;
  };

  const albumWords = selectedAlbum ? getAlbumWords(selectedAlbum) : [];

  const filteredWords = albumWords.filter(word =>
    word.word.toLowerCase().includes(wordSearchTerm.toLowerCase()) ||
    word.definition.toLowerCase().includes(wordSearchTerm.toLowerCase())
  );

  const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'mastered', label: 'Mastered' },
    { id: 'learning', label: 'Learning' },
    { id: 'not-started', label: 'Not Started' }
  ];

  const filteredByStatus = statusFilter === 'all'
    ? filteredWords
    : statusFilter === 'not-started'
    ? filteredWords.filter(w => !w.status || w.status === 'struggling')
    : filteredWords.filter(w => w.status === statusFilter);

  // If an album is selected, show the word list as table
  if (selectedAlbum) {
    const learnedPercentage = selectedAlbum.learnedPercentage;

    // Pagination logic
    const totalPages = Math.ceil(filteredByStatus.length / wordsPerPage);
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    const currentWords = filteredByStatus.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className="browse">
        <div className="browse-header">
          <div className="album-header-row">
            <svg className="back-icon" viewBox="0 0 24 24" onClick={handleBackToAlbums} style={{cursor: 'pointer'}}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <h1 className="album-title">{selectedAlbum.title}</h1>
            <span className="word-count">{albumWords.length} words</span>
            <div style={{flex: 1}}></div>
            <div className="learned-badge">
              <span>{learnedPercentage}% learned</span>
            </div>
          </div>

          <div className="search-bar">
            <svg className="icon icon-sm search-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search words in this album..."
              value={wordSearchTerm}
              onChange={(e) => setWordSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-row">
            {statusFilters.map(filter => (
              <button
                key={filter.id}
                className={`chip ${statusFilter === filter.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="word-table">
          <div className="table-header">
            <div className="th-word">Word</div>
            <div className="th-type">Type</div>
            <div className="th-definition">Definition</div>
            <div className="th-status">Status</div>
            <div className="th-accuracy">Accuracy</div>
          </div>
          {currentWords.map((word, index) => (
            <div key={word.id} className={`table-row ${index % 2 === 1 ? 'alt' : ''}`}>
              <div className="td-word">{word.word}</div>
              <div className="td-type">{word.partOfSpeech.slice(0, 4)}</div>
              <div className="td-definition">{word.definition}</div>
              <div className="td-status">
                <span className={`status-label ${word.status}`}>
                  {word.status === 'mastered' ? 'Mastered' : word.status === 'learning' ? 'Learning' : 'Not Started'}
                </span>
              </div>
              <div className="td-accuracy">
                {word.status === 'mastered' ? '95%' : word.status === 'learning' ? '72%' : '0%'}
              </div>
            </div>
          ))}
        </div>

        {filteredByStatus.length === 0 && (
          <div className="empty-state">
            <p>No words found matching your search.</p>
          </div>
        )}

        {filteredByStatus.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Previous</span>
            </button>

            <div className="pagination-numbers">
              {currentPage > 1 && (
                <button className="page-number" onClick={() => handlePageChange(1)}>
                  1
                </button>
              )}
              {currentPage > 2 && totalPages > 3 && <span className="pagination-dots">...</span>}

              <button className="page-number active">{currentPage}</button>

              {currentPage < totalPages - 1 && totalPages > 3 && <span className="pagination-dots">...</span>}
              {currentPage < totalPages && (
                <button className="page-number" onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </button>
              )}
            </div>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span>Next</span>
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
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
