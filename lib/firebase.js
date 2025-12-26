import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const validateConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  if (missingKeys.length > 0) {
    console.error('Missing Firebase config keys:', missingKeys);
    throw new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
  }
};

let app;
try {
  validateConfig();
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    }
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

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getUserToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

export { auth };
export default app;  validateConfig();
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Set auth persistence
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    }
    
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

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getUserToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

export { auth };
export default app;  validateConfig();
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Set auth persistence to local (survives browser refresh)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}

// Configure Google provider settings (optional customization)
googleProvider.setCustomParameters({
  prompt: 'select_account' // Force account selection every time
});

/**
 * Sign in with Google popup
 * @returns {Promise<import('firebase/auth').User>} User object
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    }
    
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {import('firebase/auth').User | null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get current user's ID token (useful for API authentication)
 * @param {boolean} forceRefresh - Force token refresh
 * @returns {Promise<string | null>} ID token or null if not authenticated
 */
export const getUserToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

/**
 * Subscribe to authentication state changes
 * @param {function(import('firebase/auth').User | null): void} callback - Callback function
 * @returns {function(): void} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Export auth instance for advanced use cases
export { auth };

// Export app instance for other Firebase services (if needed later)
export default app;    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
