import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getWatchlist, removeFromWatchlist } from '../lib/watchlist';
import { getImageUrl } from '../lib/tmdb';
import Head from 'next/head';

export default function WatchlistPage({ user }) {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading watchlist for user:', user.uid);
      
      const data = await getWatchlist(user.uid);
      console.log('Watchlist data received:', data);
      
      setWatchlist(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError(err.message);
      setLoading(false);
      setWatchlist([]);
    }
  };

  const handleRemove = async (movieId) => {
    setRemovingId(movieId);
    await removeFromWatchlist(user.uid, movieId);
    await loadWatchlist();
    setRemovingId(null);
  };

  const getFilteredWatchlist = () => {
    let filtered = [...watchlist];
    
    if (sortBy === 'recent') {
      filtered.sort((a, b) => {
        const dateA = a.addedAt?.seconds || 0;
        const dateB = b.addedAt?.seconds || 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.movieTitle.localeCompare(b.movieTitle));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (sortBy === 'year') {
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
    }
    
    return filtered;
  };

  const filteredWatchlist = getFilteredWatchlist();

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-netflix mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your watchlist...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">Error Loading Watchlist</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadWatchlist}
              className="px-6 py-3 bg-netflix hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Watchlist ({watchlist.length}) - MovieRec</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-netflix to-red-400 bg-clip-text text-transparent">
                My Watchlist
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} saved
              </p>
            </div>

            {watchlist.length > 0 && (
              <div className="flex gap-3 items-center flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded transition-colors duration-200 ${
                      viewMode === 'grid' ? 'bg-netflix text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded transition-colors duration-200 ${
                      viewMode === 'list' ? 'bg-netflix text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    List
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-netflix cursor-pointer"
                >
                  <option value="recent">Recently Added</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="rating">Highest Rated</option>
                  <option value="year">Newest First</option>
                </select>
              </div>
            )}
          </div>

          {/* Stats */}
          {watchlist.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card-bg rounded-xl border border-gray-800">
              <div className="text-center">
                <p className="text-3xl font-bold text-netflix">{watchlist.length}</p>
                <p className="text-gray-400 text-sm mt-1">Movies</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-netflix">
                  {(watchlist.reduce((sum, m) => sum + (parseFloat(m.rating) || 0), 0) / watchlist.length).toFixed(1)}
                </p>
                <p className="text-gray-400 text-sm mt-1">Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-netflix">
                  {Math.max(...watchlist.map(m => parseFloat(m.rating) || 0)).toFixed(1)}
                </p>
                <p className="text-gray-400 text-sm mt-1">Top Rated</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-netflix">
                  {new Set(watchlist.map(m => m.year)).size}
                </p>
                <p className="text-gray-400 text-sm mt-1">Years</p>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {watchlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📝</div>
            <h2 className="text-3xl font-bold text-white mb-3">Your watchlist is empty</h2>
            <p className="text-gray-400 text-lg mb-8">
              Start adding movies you want to watch!
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-netflix hover:bg-red-700 text-white font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Discover Movies
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6" 
            : "space-y-4"
          }>
            {filteredWatchlist.map((movie) => (
              <div key={movie.id} className={viewMode === 'grid' ? "group relative" : "flex gap-4 p-4 bg-card-bg rounded-lg border border-gray-800 hover:border-gray-700 transition-all"}>
                <img
                  src={movie.poster}
                  alt={movie.movieTitle}
                  onClick={() => router.push(`/movie/${movie.movieId}`)}
                  className={viewMode === 'grid' 
                    ? "w-full rounded-lg cursor-pointer hover:scale-105 transition-transform" 
                    : "w-24 h-36 rounded cursor-pointer hover:scale-105 transition-transform"
                  }
                />
                
                {viewMode === 'grid' ? (
                  <>
                    <div className="mt-2">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">{movie.movieTitle}</h3>
                      <p className="text-gray-400 text-xs mt-1">⭐ {movie.rating}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(movie.movieId)}
                      disabled={removingId === movie.movieId}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      {removingId === movie.movieId ? '...' : '✕'}
                    </button>
                  </>
                ) : (
                  <div className="flex-1">
                    <h3 
                      onClick={() => router.push(`/movie/${movie.movieId}`)}
                      className="text-xl font-bold text-white hover:text-netflix cursor-pointer"
                    >
                      {movie.movieTitle}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">⭐ {movie.rating} • {movie.year}</p>
                    <button
                      onClick={() => handleRemove(movie.movieId)}
                      disabled={removingId === movie.movieId}
                      className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                    >
                      {removingId === movie.movieId ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
