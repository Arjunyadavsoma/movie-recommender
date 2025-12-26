import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getWatchlist, removeFromWatchlist } from '../lib/watchlist';
import Head from 'next/head';

export default function WatchlistPage({ user }) {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    const data = await getWatchlist(user.uid);
    setWatchlist(data);
    setLoading(false);
  };

  const handleRemove = async (movieId) => {
    await removeFromWatchlist(user.uid, movieId);
    loadWatchlist();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>My Watchlist - MovieRec</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">My Watchlist</h1>

        {watchlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-400 text-xl mb-6">Your watchlist is empty</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-netflix hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Discover Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {watchlist.map((movie) => (
              <div key={movie.id} className="group relative">
                <div
                  onClick={() => router.push(`/movie/${movie.movieId}`)}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={movie.poster}
                    alt={movie.movieTitle}
                    className="w-full rounded-lg shadow-lg"
                  />
                  <div className="mt-2">
                    <h3 className="text-white font-semibold text-sm line-clamp-2">{movie.movieTitle}</h3>
                    <p className="text-gray-400 text-xs">{movie.year}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(movie.movieId)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
