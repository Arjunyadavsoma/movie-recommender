import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getMovieDetails, getImageUrl, getBackdropUrl } from '../../lib/tmdb';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../../lib/watchlist';

export default function MovieDetail({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  
  useEffect(() => {
    if (id) {
      loadMovieDetails();
      checkWatchlist();
    }
  }, [id, user]);
  
  const loadMovieDetails = async () => {
    setLoading(true);
    const details = await getMovieDetails(id);
    setMovie(details);
    setLoading(false);
  };
  
  const checkWatchlist = async () => {
    if (user && id) {
      const exists = await isInWatchlist(user.uid, id);
      setInWatchlist(exists);
    }
  };
  
  const toggleWatchlist = async () => {
    if (!user || !movie) return;
    
    if (inWatchlist) {
      await removeFromWatchlist(user.uid, movie.id);
      setInWatchlist(false);
    } else {
      await addToWatchlist(user.uid, {
        id: movie.id,
        title: movie.title,
        poster: getImageUrl(movie.poster_path),
        rating: movie.vote_average?.toFixed(1),
        year: movie.release_date?.split('-')[0]
      });
      setInWatchlist(true);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Movie not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back</span>
        </button>
      </div>
      
      {/* Movie Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <img 
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-64 rounded-lg shadow-2xl mx-auto md:mx-0"
          />
          
          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{movie.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6 text-gray-300">
              <span className="flex items-center space-x-1">
                <span className="text-yellow-400">⭐</span>
                <span className="font-bold">{movie.vote_average?.toFixed(1)}</span>
                <span className="text-gray-500">/ 10</span>
              </span>
              <span>{movie.release_date?.split('-')[0]}</span>
              <span>{movie.runtime} min</span>
              <span>{movie.status}</span>
            </div>
            
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((genre) => (
                <span key={genre.id} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={toggleWatchlist}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  inWatchlist
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-netflix hover:bg-red-700'
                }`}
              >
                {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </div>
            
            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3 text-white">Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
            </div>
            
            {/* Cast */}
            {movie.credits?.cast && (
              <div>
                <h2 className="text-2xl font-bold mb-3 text-white">Cast</h2>
                <div className="flex overflow-x-auto space-x-4 pb-4">
                  {movie.credits.cast.slice(0, 10).map((person) => (
                    <div key={person.id} className="flex-shrink-0 text-center">
                      <img
                        src={getImageUrl(person.profile_path, 'w185')}
                        alt={person.name}
                        className="w-24 h-24 rounded-full object-cover mb-2"
                      />
                      <p className="text-sm text-white font-semibold">{person.name}</p>
                      <p className="text-xs text-gray-400">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
