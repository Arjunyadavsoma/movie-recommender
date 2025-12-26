import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getWatchlist, removeFromWatchlist } from '../lib/watchlist';
import { getImageUrl } from '../lib/tmdb';
import Head from 'next/head';

export default function WatchlistPage({ user }) {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    setLoading(true);
    const data = await getWatchlist(user.uid);
    setWatchlist(data);
    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-netflix mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your watchlist...</p>
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
                    title="Grid view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded transition-colors duration-200 ${
                      viewMode === 'list' ? 'bg-netflix text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    title="List view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Sort Dropdown */}
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

          {/* Stats Bar */}
          {watchlist.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card-bg rounded-xl border border-gray-800">
              <div className="text-center">
                <p className="text-3xl font-bold text-netflix">{watchlist.length}</p>
                <p className="text-gray-400 text-sm mt-1">Total Movies</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-netflix">
                  {watchlist.length > 0 
                    ? (watchlist.reduce((sum, m) => sum + (parseFloat(m.rating) || 0), 0) / watchlist.length).toFixed(1)
                    : '0'
                  }
                </p>
                <p className="text-gray-400 text-sm mt-1">Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-netflix">
                  {watchlist.length > 0 
                    ? Math.max(...watchlist.map(m => parseFloat(m.rating) || 0)).toFixed(1)
                    : '0'
                  }
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
            <div className="text-8xl mb-6 animate-bounce">📝</div>
            <h2 className="text-3xl font-bold text-white mb-3">Your watchlist is empty</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Start building your collection! Search for movies and click the + button to add them here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-netflix hover:bg-red-700 text-white font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Discover Movies
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {filteredWatchlist.map((movie) => (
                  <div key={movie.id} className="group relative">
                    <div
                      onClick={() => router.push(`/movie/${movie.movieId}`)}
                      className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                      <div className="relative rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={movie.poster}
                          alt={movie.movieTitle}
                          className="w-full h-auto object-cover"
                        />
                        
                        {/* Rating Badge */}
                        <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-yellow-400">
                          ⭐ {movie.rating}
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                            {movie.movieTitle}
                          </h3>
                          <p className="text-gray-300 text-xs">{movie.year}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {movie.movieTitle}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          Added {new Date(movie.addedAt?.seconds * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(movie.movieId);
                      }}
                      disabled={removingId === movie.movieId}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg disabled:opacity-50"
                      title="Remove from watchlist"
                    >
                      {removingId === movie.movieId ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredWatchlist.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="flex gap-4 p-4 bg-card-bg rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-200 group"
                  >
                    {/* Poster */}
                    <img
                      src={movie.poster}
                      alt={movie.movieTitle}
                      onClick={() => router.push(`/movie/${movie.movieId}`)}
                      className="w-24 h-36 object-cover rounded cursor-pointer hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 
                          onClick={() => router.push(`/movie/${movie.movieId}`)}
                          className="text-xl font-bold text-white hover:text-netflix cursor-pointer transition-colors duration-200"
                        >
                          {movie.movieTitle}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="font-semibold">{movie.rating}</span>
                          </span>
                          <span>{movie.year}</span>
                          <span>
                            Added {new Date(movie.addedAt?.seconds * 1000).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => router.push(`/movie/${movie.movieId}`)}
                          className="px-4 py-2 bg-netflix hover:bg-red-700 text-white text-sm rounded transition-colors duration-200"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRemove(movie.movieId)}
                          disabled={removingId === movie.movieId}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors duration-200 disabled:opacity-50"
                        >
                          {removingId === movie.movieId ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
