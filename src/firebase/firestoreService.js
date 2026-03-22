import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { ieltsVocabularyDatabase } from '../data/ieltsVocabulary';

// Initialize user data in Firestore
export const initializeUserData = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document with initial data
      await setDoc(userDocRef, {
        createdAt: serverTimestamp(),
        totalWordsLearned: 0,
        totalReviews: 0,
        totalQuizzesTaken: 0,
        totalStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0
      });

      // Initialize vocabulary collection for this user
      const vocabularyRef = collection(db, 'users', userId, 'vocabulary');

      // Add all words from the database
      const batch = [];
      for (const word of ieltsVocabularyDatabase) {
        const wordDocRef = doc(vocabularyRef, word.id.toString());
        batch.push(setDoc(wordDocRef, {
          ...word,
          status: null,
          reviewCount: 0,
          lastReviewed: null,
          createdAt: serverTimestamp()
        }));
      }

      await Promise.all(batch);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error initializing user data:', error);
    return { success: false, error: error.message };
  }
};

// Get all vocabulary for a user
export const getUserVocabulary = async (userId) => {
  try {
    const vocabularyRef = collection(db, 'users', userId, 'vocabulary');
    const snapshot = await getDocs(vocabularyRef);

    const vocabulary = [];
    snapshot.forEach((doc) => {
      vocabulary.push({ id: doc.id, ...doc.data() });
    });

    return { vocabulary, error: null };
  } catch (error) {
    console.error('Error getting vocabulary:', error);
    return { vocabulary: [], error: error.message };
  }
};

// Update word status
export const updateWordStatus = async (userId, wordId, status) => {
  try {
    const wordRef = doc(db, 'users', userId, 'vocabulary', wordId.toString());
    await updateDoc(wordRef, {
      status,
      lastReviewed: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating word status:', error);
    return { success: false, error: error.message };
  }
};

// Increment review count
export const incrementReviewCount = async (userId, wordId) => {
  try {
    const wordRef = doc(db, 'users', userId, 'vocabulary', wordId.toString());
    const wordDoc = await getDoc(wordRef);

    if (wordDoc.exists()) {
      const currentCount = wordDoc.data().reviewCount || 0;
      await updateDoc(wordRef, {
        reviewCount: currentCount + 1,
        lastReviewed: serverTimestamp()
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error incrementing review count:', error);
    return { success: false, error: error.message };
  }
};

// Save study session
export const saveStudySession = async (userId, wordsStudied, duration) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'studySessions');
    const sessionDoc = doc(sessionsRef);

    await setDoc(sessionDoc, {
      wordsStudied,
      duration,
      timestamp: serverTimestamp()
    });

    // Update user stats
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentStudyTime = userDoc.data().totalStudyTime || 0;
      const currentReviews = userDoc.data().totalReviews || 0;

      await updateDoc(userRef, {
        totalStudyTime: currentStudyTime + duration,
        totalReviews: currentReviews + wordsStudied
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving study session:', error);
    return { success: false, error: error.message };
  }
};

// Save quiz result
export const saveQuizResult = async (userId, score, totalQuestions, duration, wordsQuizzed) => {
  try {
    const quizRef = collection(db, 'users', userId, 'quizResults');
    const quizDoc = doc(quizRef);

    await setDoc(quizDoc, {
      score,
      totalQuestions,
      duration,
      wordsQuizzed,
      timestamp: serverTimestamp()
    });

    // Update user stats
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentQuizzes = userDoc.data().totalQuizzesTaken || 0;
      await updateDoc(userRef, {
        totalQuizzesTaken: currentQuizzes + 1
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return { success: false, error: error.message };
  }
};

// Get user stats
export const getUserStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { stats: userDoc.data(), error: null };
    }

    return { stats: null, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { stats: null, error: error.message };
  }
};

// Get study sessions
export const getStudySessions = async (userId, limitCount = 30) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'studySessions');
    const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    const sessions = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });

    return { sessions, error: null };
  } catch (error) {
    console.error('Error getting study sessions:', error);
    return { sessions: [], error: error.message };
  }
};

// Get quiz results
export const getQuizResults = async (userId, limitCount = 50) => {
  try {
    const quizRef = collection(db, 'users', userId, 'quizResults');
    const q = query(quizRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    const quizzes = [];
    snapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });

    return { quizzes, error: null };
  } catch (error) {
    console.error('Error getting quiz results:', error);
    return { quizzes: [], error: error.message };
  }
};

// Update daily progress
export const updateDailyProgress = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const progressRef = doc(db, 'users', userId, 'dailyProgress', today);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      const current = progressDoc.data();
      await updateDoc(progressRef, {
        reviews: (current.reviews || 0) + 1
      });
    } else {
      await setDoc(progressRef, {
        date: today,
        reviews: 1,
        studyTime: 0,
        quizzesTaken: 0,
        timestamp: serverTimestamp()
      });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating daily progress:', error);
    return { success: false, error: error.message };
  }
};
