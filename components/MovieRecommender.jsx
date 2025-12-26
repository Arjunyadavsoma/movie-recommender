import { useState, useEffect } from 'react';
import { searchMovie, getImageUrl } from '../lib/tmdb';

export default function MovieRecommender({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
      
      const enriched = await Promise.all(
        recData.recommendations.map(async (movie) => {
          const tmdbData = await searchMovie(movie.title);
          
          return {
            title: movie.title,
            id: movie.id,
            poster: tmdbData ? getImageUrl(tmdbData.poster_path) : '/placeholder-movie.png',
            rating: tmdbData?.vote_average?.toFixed(1) || 'N/A',
            year: tmdbData?.release_date?.split('-')[0] || 'N/A',
            overview: tmdbData?.overview || 'No description available.',
            genres: tmdbData?.genre_ids?.slice(0, 2) || []
          };
        })
      );
      
      setRecommendations(enriched);
      
    } catch (err) {
      console.error('Recommendation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          
          {/* Autocomplete Dropdown */}
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
        
        {selectedMovie && (
          <div className="mt-6 text-gray-400">
            Showing recommendations for: <span className="text-netflix font-semibold">{selectedMovie}</span>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-center">
          {error}
        </div>
      )}
      
      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="shimmer rounded-lg h-80"></div>
          ))}
        </div>
      )}
      
      {/* Recommendations Grid */}
      {!loading && recommendations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {recommendations.map((movie, idx) => (
            <div 
              key={idx} 
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <h3 className="font-bold text-sm mb-1 line-clamp-2">{movie.title}</h3>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-yellow-400">⭐ {movie.rating}</span>
                    <span className="text-gray-300">{movie.year}</span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-3">{movie.overview}</p>
                </div>
                
                {/* Rating badge */}
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-yellow-400">
                  ⭐ {movie.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!loading && !selectedMovie && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-400 text-xl">Search for a movie to get started</p>
        </div>
      )}
    </div>
  );
}
