import { getFirestore, collection, addDoc, deleteDoc, query, where, getDocs, doc } from 'firebase/firestore';
import app from './firebase';

const db = getFirestore(app);

export async function addToWatchlist(userId, movie) {
  try {
    await addDoc(collection(db, 'watchlist'), {
      userId,
      movieId: movie.id,
      movieTitle: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      year: movie.year,
      addedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false, error: error.message };
  }
}

export async function removeFromWatchlist(userId, movieId) {
  try {
    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', userId),
      where('movieId', '==', movieId)
    );
    const snapshot = await getDocs(q);
    
    snapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'watchlist', document.id));
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return { success: false, error: error.message };
  }
}

export async function getWatchlist(userId) {
  try {
    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
}

export async function isInWatchlist(userId, movieId) {
  try {
    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', userId),
      where('movieId', '==', movieId)
    );
    const snapshot = await getDocs(q);
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
}
