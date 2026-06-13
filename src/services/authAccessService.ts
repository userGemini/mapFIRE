// src/services/authAccessService.ts

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, firestoreDb } from './firebase';

type RegisterInput = {
  nama: string;
  email: string;
  password: string;
};

export const registerUser = async ({
  nama,
  email,
  password,
}: RegisterInput): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await setDoc(doc(firestoreDb, 'users', user.uid), {
    uid: user.uid,
    nama,
    email: user.email,
    role: 'user',
    canAccess: true,
    status: 'active',
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return user;
};

export const loginUserDenganFirestore = async (
  email: string,
  password: string,
): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const userRef = doc(firestoreDb, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    await signOut(auth);
    throw new Error('Kamu belum mendaftar.');
  }

  const userData = userSnapshot.data();

  if (userData.canAccess !== true || userData.status !== 'active') {
    await signOut(auth);
    throw new Error('Akun kamu belum memiliki akses masuk.');
  }

  await setDoc(
    userRef,
    {
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );

  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
<<<<<<< HEAD
};
=======
};
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
