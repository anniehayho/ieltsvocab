// Sample IELTS vocabulary data
export const vocabularyData = [
  {
    id: 1,
    word: "Ubiquitous",
    pronunciation: "/juːˈbɪkwɪtəs/",
    partOfSpeech: "adjective",
    definition: "Present, appearing, or found everywhere; very common.",
    example: "Smartphones have become ubiquitous in modern society.",
    category: "Academic",
    bandLevel: "7-8",
    synonyms: ["omnipresent", "pervasive", "universal"],
    status: "mastered",
    lastReviewed: new Date().toISOString(),
    reviewCount: 12
  },
  {
    id: 2,
    word: "Mitigate",
    pronunciation: "/ˈmɪtɪɡeɪt/",
    partOfSpeech: "verb",
    definition: "To make less severe, serious, or painful.",
    example: "The company took steps to mitigate the environmental impact of their operations.",
    category: "Academic",
    bandLevel: "7-8",
    synonyms: ["alleviate", "reduce", "diminish"],
    status: "learning",
    lastReviewed: new Date(Date.now() - 86400000).toISOString(),
    reviewCount: 5
  },
  {
    id: 3,
    word: "Ambiguous",
    pronunciation: "/æmˈbɪɡjuəs/",
    partOfSpeech: "adjective",
    definition: "Open to more than one interpretation; not having one obvious meaning.",
    example: "The politician's statement was deliberately ambiguous.",
    category: "Academic",
    bandLevel: "7-8",
    synonyms: ["unclear", "vague", "equivocal"],
    status: "learning",
    lastReviewed: new Date(Date.now() - 172800000).toISOString(),
    reviewCount: 3
  },
  {
    id: 4,
    word: "Comprehensive",
    pronunciation: "/ˌkɒmprɪˈhensɪv/",
    partOfSpeech: "adjective",
    definition: "Including or dealing with all or nearly all elements or aspects of something.",
    example: "The report provides a comprehensive analysis of the economic situation.",
    category: "Academic",
    bandLevel: "5-6",
    synonyms: ["thorough", "complete", "extensive"],
    status: "mastered",
    lastReviewed: new Date().toISOString(),
    reviewCount: 15
  },
  {
    id: 5,
    word: "Deteriorate",
    pronunciation: "/dɪˈtɪəriəreɪt/",
    partOfSpeech: "verb",
    definition: "To become progressively worse.",
    example: "Relations between the two countries have deteriorated sharply.",
    category: "Academic",
    bandLevel: "7-8",
    synonyms: ["worsen", "decline", "degenerate"],
    status: "struggling",
    lastReviewed: new Date(Date.now() - 259200000).toISOString(),
    reviewCount: 7
  },
  {
    id: 6,
    word: "Elaborate",
    pronunciation: "/ɪˈlæbərət/",
    partOfSpeech: "adjective/verb",
    definition: "Involving many carefully arranged parts or details; to develop or present in detail.",
    example: "She made elaborate preparations for the ceremony.",
    category: "General",
    bandLevel: "5-6",
    synonyms: ["detailed", "intricate", "complex"],
    status: "learning",
    lastReviewed: new Date(Date.now() - 86400000).toISOString(),
    reviewCount: 4
  },
  {
    id: 7,
    word: "Fundamental",
    pronunciation: "/ˌfʌndəˈmentl/",
    partOfSpeech: "adjective",
    definition: "Forming a necessary base or core; of central importance.",
    example: "The protection of human rights is fundamental to democracy.",
    category: "Academic",
    bandLevel: "5-6",
    synonyms: ["basic", "essential", "core"],
    status: "mastered",
    lastReviewed: new Date().toISOString(),
    reviewCount: 20
  },
  {
    id: 8,
    word: "Inevitable",
    pronunciation: "/ɪnˈevɪtəbl/",
    partOfSpeech: "adjective",
    definition: "Certain to happen; unavoidable.",
    example: "Change is inevitable in any organization.",
    category: "General",
    bandLevel: "5-6",
    synonyms: ["unavoidable", "inescapable", "certain"],
    status: "learning",
    lastReviewed: new Date(Date.now() - 172800000).toISOString(),
    reviewCount: 6
  },
  {
    id: 9,
    word: "Phenomenon",
    pronunciation: "/fəˈnɒmɪnən/",
    partOfSpeech: "noun",
    definition: "A fact or situation that is observed to exist or happen.",
    example: "Social media is a relatively new phenomenon.",
    category: "Academic",
    bandLevel: "7-8",
    synonyms: ["occurrence", "event", "fact"],
    status: "mastered",
    lastReviewed: new Date().toISOString(),
    reviewCount: 10
  },
  {
    id: 10,
    word: "Substantial",
    pronunciation: "/səbˈstænʃl/",
    partOfSpeech: "adjective",
    definition: "Of considerable importance, size, or worth.",
    example: "The research requires substantial funding.",
    category: "Academic",
    bandLevel: "5-6",
    synonyms: ["significant", "considerable", "large"],
    status: "learning",
    lastReviewed: new Date(Date.now() - 86400000).toISOString(),
    reviewCount: 8
  },
  {
    id: 11,
    word: "Versatile",
    pronunciation: "/ˈvɜːsətaɪl/",
    partOfSpeech: "adjective",
    definition: "Able to adapt or be adapted to many different functions or activities.",
    example: "She is a versatile performer who can sing, dance, and act.",
    category: "General",
    bandLevel: "7-8",
    synonyms: ["adaptable", "flexible", "multifaceted"],
    status: "struggling",
    lastReviewed: new Date(Date.now() - 345600000).toISOString(),
    reviewCount: 2
  },
  {
    id: 12,
    word: "Coherent",
    pronunciation: "/kəʊˈhɪərənt/",
    partOfSpeech: "adjective",
    definition: "Logical and consistent; forming a unified whole.",
    example: "The witness gave a coherent account of the events.",
    category: "Academic",
    bandLevel: "7-8",
    synonyms: ["logical", "consistent", "rational"],
    status: "learning",
    lastReviewed: new Date(Date.now() - 172800000).toISOString(),
    reviewCount: 5
  }
];

// Helper functions for localStorage
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const initializeVocabulary = () => {
  const stored = loadFromLocalStorage('vocabulary');
  if (!stored) {
    saveToLocalStorage('vocabulary', vocabularyData);
    return vocabularyData;
  }
  return stored;
};

export const updateWordStatus = (wordId, newStatus) => {
  const vocabulary = loadFromLocalStorage('vocabulary', vocabularyData);
  const updatedVocabulary = vocabulary.map(word =>
    word.id === wordId
      ? { ...word, status: newStatus, lastReviewed: new Date().toISOString() }
      : word
  );
  saveToLocalStorage('vocabulary', updatedVocabulary);
  return updatedVocabulary;
};

export const incrementReviewCount = (wordId) => {
  const vocabulary = loadFromLocalStorage('vocabulary', vocabularyData);
  const updatedVocabulary = vocabulary.map(word =>
    word.id === wordId
      ? { ...word, reviewCount: word.reviewCount + 1, lastReviewed: new Date().toISOString() }
      : word
  );
  saveToLocalStorage('vocabulary', updatedVocabulary);
  return updatedVocabulary;
};
