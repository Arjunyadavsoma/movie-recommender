import { useState, useEffect } from 'react';
import { addRating, getMovieRatings, getUserRating, likeReview } from '../lib/ratings';

export default function RatingSection({ user, movieId, movieTitle }) {
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRatings();
    if (user) loadUserRating();
  }, [movieId, user]);

  const loadRatings = async () => {
    const data = await getMovieRatings(movieId);
    setRatings(data.sort((a, b) => b.likes - a.likes));
  };

  const loadUserRating = async () => {
    const data = await getUserRating(user.uid, movieId);
    setUserRating(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await addRating(
      user.uid,
      user.displayName || user.email,
      movieId,
      movieTitle,
      rating,
      review
    );

    setReview('');
    setShowForm(false);
    loadRatings();
    loadUserRating();
    setLoading(false);
  };

  const handleLike = async (reviewId, currentLikes) => {
    await likeReview(reviewId, currentLikes);
    loadRatings();
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">User Reviews</h2>
          {ratings.length > 0 && (
            <p className="text-gray-400 mt-1">
              ⭐ {averageRating} average from {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
            </p>
          )}
        </div>

        {user && !userRating && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-netflix hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            {showForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card-bg p-6 rounded-lg mb-6">
          <div className="mb-4">
            <label className="block text-white mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Review</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-netflix"
              rows="4"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-netflix hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* User's Existing Rating */}
      {userRating && (
        <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg mb-6">
          <p className="text-green-400 font-semibold mb-2">Your Review</p>
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < userRating.rating ? 'text-yellow-400' : 'text-gray-600'}>
                ★
              </span>
            ))}
          </div>
          <p className="text-white">{userRating.review}</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          ratings.map((r) => (
            <div key={r.id} className="bg-card-bg p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-white font-semibold">{r.userName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < r.rating ? 'text-yellow-400 text-sm' : 'text-gray-600 text-sm'}>
                        ★
                      </span>
                    ))}
                    <span className="text-gray-500 text-xs">
                      {new Date(r.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleLike(r.id, r.likes)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors duration-200"
                >
                  👍 {r.likes}
                </button>
              </div>
              <p className="text-gray-300">{r.review}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
