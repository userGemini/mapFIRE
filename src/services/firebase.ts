// src/services/firebase.ts

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJ8C3Ia8Z5l8Wo8YaZ4BicwKMioeb8EDU",
  authDomain: "datarumah-1d262.firebaseapp.com",
  projectId: "datarumah-1d262",
  storageBucket: "datarumah-1d262.firebasestorage.app",
  messagingSenderId: "727857151969",
  appId: "1:727857151969:web:1a412d348d47109c2d5ca0",
  measurementId: "G-YZMTN85X92"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const firestoreDb = db;
export const realtimeDb = getDatabase(app);
export const auth = getAuth(app);

<<<<<<< HEAD
export default app;
=======
export default app;

>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
