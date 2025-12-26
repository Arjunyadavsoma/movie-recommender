import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import app from './firebase';

const db = getFirestore(app);

export async function addRating(userId, userName, movieId, movieTitle, rating, review) {
  try {
    await addDoc(collection(db, 'ratings'), {
      userId,
      userName,
      movieId,
      movieTitle,
      rating, // 1-5 stars
      review,
      likes: 0,
      createdAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding rating:', error);
    return { success: false, error: error.message };
  }
}

export async function getMovieRatings(movieId) {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('movieId', '==', movieId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

export async function getUserRating(userId, movieId) {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('userId', '==', userId),
      where('movieId', '==', movieId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return null;
  }
}

export async function likeReview(reviewId, currentLikes) {
  try {
    await updateDoc(doc(db, 'ratings', reviewId), {
      likes: currentLikes + 1
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
