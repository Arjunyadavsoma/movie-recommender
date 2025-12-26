import { useState, useEffect } from 'react';
import { searchMovie, getImageUrl, getTrendingMovies, getBackdropUrl } from '../lib/tmdb';
import { useRouter } from 'next/router';
import FilterBar from './FilterBar';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '../lib/watchlist';

export default function MovieRecommender({ user }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filters, setFilters] = useState({ genre: 'All', minRating: 0, sortBy: 'popularity' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadTrendingMovies();
  }, []);
  
  const loadTrendingMovies = async () => {
    setLoading(true);
    const trending = await getTrendingMovies('day');
    setTrendingMovies(trending);
    setFilteredMovies(trending);
    setLoading(false);
  };
  
  useEffect(() => {
    applyFilters();
  }, [filters, trendingMovies]);
  
  const applyFilters = () => {
    let filtered = [...trendingMovies];
    
    if (filters.genre !== 'All') {
      const genreMap = {
        'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
        'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
        'Fantasy': 14, 'Horror': 27, 'Mystery': 9648, 'Romance': 10749,
        'Sci-Fi': 878, 'Thriller': 53, 'War': 10752
      };
      const genreId = genreMap[filters.genre];
      filtered = filtered.filter(m => m.genre_ids?.includes(genreId));
    }
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(m => m.vote_average >= filters.minRating);
    }
    
    if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.vote_average - a.vote_average);
    } else if (filters.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (filters.sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredMovies(filtered);
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&limit=8`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  const handleSelectMovie = async (movieTitle) => {
    setLoading(true);
    setError(null);
    setSearchQuery(movieTitle);
    setSuggestions([]);
    setSelectedMovie(movieTitle);
    
    try {
      // Step 1: Get the searched movie details from TMDB
      const tmdbMovie = await searchMovie(movieTitle);
      
      if (!tmdbMovie) {
        throw new Error('Movie not found on TMDB');
      }
      
      setSelectedMovieDetails(tmdbMovie);
      
      // Step 2: Get recommendations from your ML model
      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle, topN: 12 })
      });
      
      if (!recRes.ok) {
        const errorData = await recRes.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }
      
      const recData = await recRes.json();
      
      // Step 3: Enrich recommendations with TMDB data
      const enriched = await Promise.all(
        recData.recommendations.map(async (movie) => {
          const tmdbData = await searchMovie(movie.title);
          
          return {
            title: movie.title,
            id: movie.id,
            tmdbId: tmdbData?.id,
            poster: tmdbData ? getImageUrl(tmdbData.poster_path) : '/placeholder-movie.png',
            rating: tmdbData?.vote_average?.toFixed(1) || 'N/A',
            year: tmdbData?.release_date?.split('-')[0] || 'N/A',
            overview: tmdbData?.overview || 'No description available.'
          };
        })
      );
      
      setRecommendations(enriched);
      
    } catch (err) {
      console.error('Recommendation error:', err);
      setError(err.message);
      setSelectedMovieDetails(null);
    } finally {
      setLoading(false);
    }
  };
  
  const MovieCard = ({ movie, onClick, showWatchlistButton = true }) => {
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loadingWatchlist, setLoadingWatchlist] = useState(false);

    useEffect(() => {
      if (user && movie.id) {
        checkWatchlist();
      }
    }, [user, movie.id]);

    const checkWatchlist = async () => {
      const exists = await isInWatchlist(user.uid, movie.id || movie.tmdbId);
      setInWatchlist(exists);
    };

    const handleWatchlistToggle = async (e) => {
      e.stopPropagation();
      if (!user) return;
      
      setLoadingWatchlist(true);
      if (inWatchlist) {
        await removeFromWatchlist(user.uid, movie.id || movie.tmdbId);
        setInWatchlist(false);
      } else {
        await addToWatchlist(user.uid, {
          id: movie.id || movie.tmdbId,
          title: movie.title,
          poster: movie.poster || getImageUrl(movie.poster_path),
          rating: movie.rating || movie.vote_average?.toFixed(1),
          year: movie.year || movie.release_date?.split('-')[0]
        });
        setInWatchlist(true);
      }
      setLoadingWatchlist(false);
    };

    return (
      <div 
        onClick={() => onClick && onClick(movie)}
        className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
      >
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img 
            src={movie.poster || getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-auto object-cover"
          />
          
          {showWatchlistButton && user && (
            <button
              onClick={handleWatchlistToggle}
              disabled={loadingWatchlist}
              className={`absolute top-2 left-2 p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                inWatchlist 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-black/60 hover:bg-black/80'
              }`}
              title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {loadingWatchlist ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : inWatchlist ? (
                <span className="text-white text-sm">✓</span>
              ) : (
                <span className="text-white text-sm">+</span>
              )}
            </button>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <h3 className="font-bold text-sm mb-1 line-clamp-2">{movie.title}</h3>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-yellow-400">⭐ {movie.rating || movie.vote_average?.toFixed(1)}</span>
              <span className="text-gray-300">{movie.year || movie.release_date?.split('-')[0]}</span>
            </div>
            <p className="text-xs text-gray-300 line-clamp-3">{movie.overview}</p>
          </div>
          
          <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-yellow-400">
            ⭐ {movie.rating || movie.vote_average?.toFixed(1)}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Search Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-netflix to-red-400 bg-clip-text text-transparent">
          Find Similar Movies
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Search for a movie and discover AI-powered recommendations
        </p>
        
        <div className="max-w-2xl mx-auto relative">
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a movie... (e.g., Inception, The Dark Knight)"
              className="w-full px-6 py-4 bg-card-bg border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-netflix transition-colors duration-200 text-lg"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              🔍
            </div>
          </div>
          
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-2 bg-card-bg border border-gray-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
              {suggestions.map((title, idx) => (
                <li 
                  key={idx}
                  onClick={() => handleSelectMovie(title)}
                  className="px-6 py-3 hover:bg-gray-800 cursor-pointer transition-colors duration-150 border-b border-gray-800 last:border-b-0 text-left"
                >
                  <span className="text-white">{title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-center">
          {error}
        </div>
      )}
      
      {/* Selected Movie Hero Section - NEW */}
      {selectedMovieDetails && !loading && (
        <div className="mb-12">
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage: `url(${getBackdropUrl(selectedMovieDetails.backdrop_path)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-dark-bg/40" />
            
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Poster */}
                <img 
                  src={getImageUrl(selectedMovieDetails.poster_path)}
                  alt={selectedMovieDetails.title}
                  className="w-48 md:w-64 rounded-lg shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => router.push(`/movie/${selectedMovieDetails.id}`)}
                />
                
                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    {selectedMovieDetails.title}
                  </h1>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6 text-gray-300">
                    <span className="flex items-center space-x-1">
                      <span className="text-yellow-400 text-2xl">⭐</span>
                      <span className="font-bold text-xl">{selectedMovieDetails.vote_average?.toFixed(1)}</span>
                      <span className="text-gray-500">/ 10</span>
                    </span>
                    <span className="text-lg">{selectedMovieDetails.release_date?.split('-')[0]}</span>
                    <span className="px-3 py-1 bg-netflix/80 rounded-full text-sm font-semibold">
                      You searched this
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-3xl">
                    {selectedMovieDetails.overview}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button
                      onClick={() => router.push(`/movie/${selectedMovieDetails.id}`)}
                      className="px-6 py-3 bg-netflix hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      View Full Details
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedMovie(null);
                        setSelectedMovieDetails(null);
                        setRecommendations([]);
                        setSearchQuery('');
                      }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Bar - Only show when viewing trending */}
      {!selectedMovie && (
        <FilterBar onFilterChange={handleFilterChange} />
      )}
      
      {/* Trending Section */}
      {!selectedMovie && !loading && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">
              🔥 {filters.genre !== 'All' ? `${filters.genre} Movies` : 'Trending Today'}
            </h3>
            <span className="text-gray-400">{filteredMovies.length} movies</span>
          </div>
          
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies match your filters. Try adjusting them!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {filteredMovies.slice(0, 18).map((movie, idx) => (
                <MovieCard 
                  key={idx} 
                  movie={movie}
                  user={user}
                  onClick={(m) => router.push(`/movie/${m.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="shimmer rounded-lg h-80"></div>
          ))}
        </div>
      )}
      
      {/* Recommendations Section - Shows AFTER selected movie */}
      {!loading && recommendations.length > 0 && selectedMovieDetails && (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-white">
            🎬 Because you searched for <span className="text-netflix">{selectedMovie}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {recommendations.map((movie, idx) => (
              <MovieCard 
                key={idx} 
                movie={movie}
                user={user}
                onClick={(m) => router.push(`/movie/${m.tmdbId || m.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
