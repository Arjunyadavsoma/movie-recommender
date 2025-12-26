import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBc1f8b_pdhRxv9jPy85JxRN04OLilTBIQ",
  authDomain: "globalchat-3090d.firebaseapp.com",
  projectId: "globalchat-3090d",
  storageBucket: "globalchat-3090d.firebasestorage.app",
  messagingSenderId: "34053845818",
  appId: "1:34053845818:web:3a1a40690adcf83fde5603"
};

// Initialize Firebase (avoid multiple instances)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
