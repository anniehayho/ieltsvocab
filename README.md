# 📚 IELTS Vocabulary App

A modern vocabulary learning app with 1000 IELTS words, user authentication, cloud sync, and offline support.

---

## ✨ Features

- **1000 IELTS Words** - Organized by 10 categories and 4 band levels (6.0-9.0)
- **User Authentication** - Email/password and Google sign-in via Firebase
- **Cloud Sync** - Multi-device support with Firestore
- **Offline Mode** - Works without internet using localStorage
- **Progress Tracking** - Study time, streaks, quiz scores
- **Multi-User Support** - Each user has isolated data

---

## 🚀 Quick Start

### Development
```bash
npm install
npm start
```

Visit: http://localhost:5174

### Production Build
```bash
npm run build
```

### Deploy to Vercel
```bash
npm run deploy
```

---

## 📦 Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Firebase (Auth + Firestore)
- **Hosting:** Vercel
- **Database:** 1000-word IELTS vocabulary (static file)
- **Styling:** CSS

---

## 🔧 Environment Variables

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

---

## 📋 Project Structure

```
src/
├── components/          # React components
│   ├── Home.jsx        # Dashboard
│   ├── Browse.jsx      # Browse 1000 words
│   ├── Study.jsx       # Flashcard study mode
│   ├── Quiz.jsx        # Quiz mode
│   └── Progress.jsx    # Statistics
├── data/
│   ├── ieltsVocabularyComplete.js  # 1000 words (single source)
│   ├── vocabularyData.js           # Data operations
│   └── hybridDataService.js        # localStorage + Firestore
├── firebase/
│   ├── config.js       # Firebase setup
│   ├── authService.js  # Authentication
│   └── firestoreService.js  # Database
└── utils/
    └── storage.js      # localStorage with user isolation
```

---

## 📚 Documentation

- **QUICK_START.md** - Deploy in 5 minutes
- **FINAL_SUMMARY.md** - Complete technical documentation
- **DEPLOY_VERCEL.md** - Detailed Vercel deployment guide
- **FIRESTORE_TESTING_GUIDE.md** - Testing guide

---

## 🔐 Firestore Security Rules

Set in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🧪 Testing

### Local Testing
1. Run `npm start`
2. Open http://localhost:5174
3. Sign up with test account
4. Study words and verify they save

### Production Testing
1. Deploy to Vercel
2. Clear localStorage: `localStorage.clear(); location.reload();`
3. Verify 1000 words load
4. Test multi-device sync

---

## 📊 Performance

- **Bundle Size:** 1.02 MB (247 KB gzipped)
- **Load Time:** 1-2 seconds on 4G
- **Optimizations:** React.memo, useMemo, useCallback
- **Can Support:** 10,000+ users/month on free tier

---

## 💰 Cost

**Free Tier (Vercel + Firebase):**
- Hosting: Free (100 GB bandwidth/month)
- Authentication: Free (unlimited users)
- Firestore: Free (50K reads, 20K writes/day)
- **Total:** $0/month for thousands of users

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run deploy
```

**After deployment:**
1. Add all 7 Firebase environment variables in Vercel dashboard
2. Redeploy
3. Clear localStorage on deployed site
4. Verify 1000 words appear

---

## 🆘 Common Issues

### Only 60 words showing
**Solution:** Clear localStorage on deployed site
```javascript
localStorage.clear();
location.reload();
```

### Firebase not working
**Solution:** Add environment variables in Vercel dashboard and redeploy

### Empty page
**Solution:** Check environment variables are set and Firestore rules are published

---

## 📝 Scripts

```bash
npm start          # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run deploy     # Deploy to Vercel
```

---

## 🎯 Data Source

**Single Source of Truth:** `src/data/ieltsVocabularyComplete.js`
- 1000 IELTS words
- 10 categories × 100 words
- Band levels: 6.0-6.5, 7.0-7.5, 8.0-8.5, 9.0
- Used by all components

---

## ✅ Production Ready

- [x] 1000 IELTS words (single data source)
- [x] User authentication and authorization
- [x] Multi-user data isolation
- [x] Cloud sync with Firestore
- [x] Offline support with localStorage
- [x] Performance optimized
- [x] Security rules configured
- [x] Build tested and working
- [x] Ready to deploy

---

**Built with React + Firebase + Vercel**

Deploy in 5 minutes → See `QUICK_START.md`
