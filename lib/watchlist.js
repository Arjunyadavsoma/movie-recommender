import { getFirestore, collection, addDoc, deleteDoc, query, where, getDocs, doc } from 'firebase/firestore';
import app from './firebase';

const db = getFirestore(app);

export async function addToWatchlist(userId, movie) {
  try {
    const docRef = await addDoc(collection(db, 'watchlist'), {
      userId,
      movieId: movie.id,
      movieTitle: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      year: movie.year,
      addedAt: new Date()
    });
    console.log('Added to watchlist:', docRef.id);
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
    
    const deletePromises = snapshot.docs.map(document => 
      deleteDoc(doc(db, 'watchlist', document.id))
    );
    await Promise.all(deletePromises);
    
    console.log('Removed from watchlist:', movieId);
    return { success: true };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return { success: false, error: error.message };
  }
}

export async function getWatchlist(userId) {
  try {
    console.log('Fetching watchlist for user:', userId);
    
    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    console.log('Watchlist snapshot size:', snapshot.size);
    
    const watchlist = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Watchlist loaded:', watchlist.length, 'movies');
    return watchlist;
    
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    // Return empty array instead of throwing
    return [];
  }
}

export async function isInWatchlist(userId, movieId) {
  try {
    if (!userId || !movieId) {
      console.warn('Missing userId or movieId');
      return false;
    }
    
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
