import { useState, useEffect } from 'react';
import { searchMovie, getImageUrl } from '../lib/tmdb';
import styles from './MovieRecommender.module.css';

export default function MovieRecommender({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Debounced autocomplete search
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
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Get recommendations
  const handleSelectMovie = async (movieTitle) => {
    setLoading(true);
    setError(null);
    setSearchQuery(movieTitle);
    setSuggestions([]);
    setSelectedMovie(movieTitle);
    
    try {
      // Step 1: Get recommendations from your ML model
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
      
      // Step 2: Enrich with TMDB data (parallel requests)
      const enriched = await Promise.all(
        recData.recommendations.map(async (movie) => {
          const tmdbData = await searchMovie(movie.title);
          
          return {
            title: movie.title,
            id: movie.id,
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
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      {/* Search Section */}
      <div className={styles.searchSection}>
        <h2>Find Similar Movies</h2>
        <div className={styles.searchBox}>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a movie..."
            className={styles.searchInput}
          />
          
          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((title, idx) => (
                <li 
                  key={idx}
                  onClick={() => handleSelectMovie(title)}
                  className={styles.suggestionItem}
                >
                  {title}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {selectedMovie && (
          <p className={styles.selectedMovie}>
            Showing recommendations for: <strong>{selectedMovie}</strong>
          </p>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Finding similar movies...</p>
        </div>
      )}
      
      {/* Recommendations Grid */}
      {!loading && recommendations.length > 0 && (
        <div className={styles.grid}>
          {recommendations.map((movie, idx) => (
            <div key={idx} className={styles.card}>
              <img 
                src={movie.poster} 
                alt={movie.title}
                className={styles.poster}
              />
              <div className={styles.cardContent}>
                <h3 className={styles.title}>{movie.title}</h3>
                <div className={styles.meta}>
                  <span className={styles.rating}>⭐ {movie.rating}</span>
                  <span className={styles.year}>{movie.year}</span>
                </div>
                <p className={styles.overview}>
                  {movie.overview.length > 120 
                    ? `${movie.overview.substring(0, 120)}...` 
                    : movie.overview}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!loading && !selectedMovie && (
        <div className={styles.emptyState}>
          <p>🎬 Search for a movie to get personalized recommendations</p>
        </div>
      )}
    </div>
  );
}
