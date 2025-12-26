import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getMovieDetails, getImageUrl, getBackdropUrl, getSimilarMovies } from '../../lib/tmdb';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../../lib/watchlist';
import Head from 'next/head';

export default function MovieDetail({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [checkingWatchlist, setCheckingWatchlist] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTrailer, setShowTrailer] = useState(false);
  
  useEffect(() => {
    if (id && user) {
      loadMovieDetails();
      loadSimilarMovies();
      checkWatchlistStatus();
    } else if (id && !user) {
      loadMovieDetails();
      loadSimilarMovies();
      setCheckingWatchlist(false);
    }
  }, [id, user]);
  
  const loadMovieDetails = async () => {
    setLoading(true);
    const details = await getMovieDetails(id);
    setMovie(details);
    setLoading(false);
  };

  const loadSimilarMovies = async () => {
    setLoadingSimilar(true);
    const similar = await getSimilarMovies(id, 6);
    setSimilarMovies(similar);
    setLoadingSimilar(false);
  };
  
  const checkWatchlistStatus = async () => {
    if (!user || !id) {
      setCheckingWatchlist(false);
      return;
    }
    
    setCheckingWatchlist(true);
    try {
      const exists = await isInWatchlist(user.uid, id);
      setInWatchlist(exists);
    } catch (error) {
      console.error('Error checking watchlist:', error);
    } finally {
      setCheckingWatchlist(false);
    }
  };
  
  const toggleWatchlist = async () => {
    if (!user || !movie) {
      alert('Please sign in to add movies to your watchlist');
      return;
    }
    
    const previousState = inWatchlist;
    setInWatchlist(!inWatchlist);
    setWatchlistLoading(true);
    
    try {
      if (previousState) {
        const result = await removeFromWatchlist(user.uid, movie.id);
        if (!result.success) throw new Error('Failed to remove from watchlist');
      } else {
        const result = await addToWatchlist(user.uid, {
          id: movie.id,
          title: movie.title,
          poster: getImageUrl(movie.poster_path),
          rating: movie.vote_average?.toFixed(1),
          year: movie.release_date?.split('-')[0]
        });
        if (!result.success) throw new Error('Failed to add to watchlist');
      }
    } catch (error) {
      console.error('Watchlist error:', error);
      setInWatchlist(previousState);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setWatchlistLoading(false);
    }
  };
  
  const getTrailerKey = () => {
    if (!movie?.videos?.results) return null;
    const trailer = movie.videos.results.find(
      v => v.type === 'Trailer' && v.site === 'YouTube'
    );
    return trailer?.key || null;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-netflix mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading movie details...</p>
        </div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-3">Movie not found</h2>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-netflix hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const trailerKey = getTrailerKey();
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
  const revenue = movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A';
  
  return (
    <>
      <Head>
        <title>{movie.title} - MovieRec</title>
        <meta name="description" content={movie.overview} />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section - SAME AS BEFORE */}
        <div className="relative">
          <div 
            className="h-[70vh] bg-cover bg-center relative"
            style={{ backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-dark-bg/40" />
            
            <button
              onClick={() => router.back()}
              className="absolute top-6 left-6 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-lg transition-all duration-200 flex items-center space-x-2 z-10 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 items-end">
                  <div className="flex-shrink-0">
                    <img 
                      src={getImageUrl(movie.poster_path, 'w500')}
                      alt={movie.title}
                      className="w-48 md:w-64 rounded-xl shadow-2xl border-4 border-dark-bg"
                    />
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                      {movie.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-4 mb-6 items-center">
                      <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <span className="text-yellow-400 text-2xl">⭐</span>
                        <span className="text-white font-bold text-xl">{movie.vote_average?.toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({movie.vote_count?.toLocaleString()} votes)</span>
                      </div>
                      
                      <span className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-semibold">
                        {movie.release_date?.split('-')[0]}
                      </span>
                      
                      <span className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
                        {runtime}
                      </span>
                      
                      {movie.adult && (
                        <span className="bg-red-600 px-3 py-1 rounded text-white text-sm font-bold">
                          18+
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {trailerKey && (
                        <button
                          onClick={() => setShowTrailer(true)}
                          className="px-6 py-3 bg-white hover:bg-gray-200 text-dark-bg font-bold rounded-lg transition-all duration-200 flex items-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          <span>Play Trailer</span>
                        </button>
                      )}
                      
                      <button
                        onClick={toggleWatchlist}
                        disabled={watchlistLoading || checkingWatchlist || !user}
                        className={`px-6 py-3 font-bold rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                          inWatchlist 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {watchlistLoading || checkingWatchlist ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                          </>
                        ) : inWatchlist ? (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add to Watchlist</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => window.open(`https://www.imdb.com/title/${movie.imdb_id}`, '_blank')}
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-dark-bg font-bold rounded-lg transition-all duration-200"
                      >
                        IMDb
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trailer Modal - SAME AS BEFORE */}
        {showTrailer && trailerKey && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTrailer(false)}
          >
            <div className="relative w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-12 right-0 text-white hover:text-netflix transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-gray-800">
            {['overview', 'cast', 'details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-lg font-semibold capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'text-netflix border-b-2 border-netflix'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres?.map((genre) => (
                    <span 
                      key={genre.id} 
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors duration-200 cursor-pointer"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">Storyline</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
              </div>

              {movie.tagline && (
                <div className="p-6 bg-card-bg border-l-4 border-netflix rounded-lg">
                  <p className="text-xl italic text-gray-300">"{movie.tagline}"</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cast' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Cast & Crew</h3>
              
              {movie.credits?.crew && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-400 mb-3">Director</h4>
                  <div className="flex flex-wrap gap-4">
                    {movie.credits.crew
                      .filter(person => person.job === 'Director')
                      .map((director) => (
                        <div key={director.id} className="text-center">
                          <img
                            src={getImageUrl(director.profile_path, 'w185')}
                            alt={director.name}
                            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-netflix"
                          />
                          <p className="text-white font-semibold">{director.name}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movie.credits?.cast?.slice(0, 15).map((person) => (
                  <div key={person.id} className="group">
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img
                        src={getImageUrl(person.profile_path, 'w185')}
                        alt={person.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <p className="text-white text-sm">{person.character}</p>
                      </div>
                    </div>
                    <p className="text-white font-semibold text-sm">{person.name}</p>
                    <p className="text-gray-400 text-xs">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <DetailRow label="Status" value={movie.status} />
                <DetailRow label="Release Date" value={new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                <DetailRow label="Runtime" value={runtime} />
                <DetailRow label="Budget" value={movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A'} />
                <DetailRow label="Revenue" value={revenue} />
                <DetailRow label="Original Language" value={movie.original_language?.toUpperCase()} />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-400 mb-2">Production Companies</h4>
                  <div className="flex flex-wrap gap-3">
                    {movie.production_companies?.map((company) => (
                      <span key={company.id} className="px-3 py-1 bg-card-bg rounded text-gray-300 text-sm">
                        {company.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-400 mb-2">Production Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.production_countries?.map((country) => (
                      <span key={country.iso_3166_1} className="px-3 py-1 bg-card-bg rounded text-gray-300 text-sm">
                        {country.name}
                      </span>
                    ))}
                  </div>
                </div>

                {movie.homepage && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">Official Website</h4>
                    <a 
                      href={movie.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-netflix hover:underline"
                    >
                      Visit Website →
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 🆕 SIMILAR MOVIES SECTION - NEW! */}
        {similarMovies.length > 0 && (
          <div className="bg-card-bg py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  More Like This
                </h3>
                <span className="text-gray-400 text-sm">{similarMovies.length} similar movies</span>
              </div>

              {loadingSimilar ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="shimmer rounded-lg h-80"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {similarMovies.map((similarMovie) => (
                    <SimilarMovieCard 
                      key={similarMovie.id}
                      movie={similarMovie}
                      onNavigate={() => router.push(`/movie/${similarMovie.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Helper Component for Detail Rows
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-800">
      <span className="text-gray-400 font-semibold">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

// 🆕 NEW: Similar Movie Card Component
function SimilarMovieCard({ movie, onNavigate }) {
  return (
    <div 
      onClick={onNavigate}
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
    >
      <div className="relative rounded-lg overflow-hidden shadow-lg">
        <img 
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-yellow-400">
          ⭐ {movie.vote_average?.toFixed(1)}
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <h4 className="font-bold text-sm mb-1 line-clamp-2 text-white">{movie.title}</h4>
          <div className="flex items-center justify-between text-xs">
            <span className="text-yellow-400">⭐ {movie.vote_average?.toFixed(1)}</span>
            <span className="text-gray-300">{movie.release_date?.split('-')[0]}</span>
          </div>
          <p className="text-xs text-gray-300 line-clamp-2 mt-2">{movie.overview}</p>
        </div>
      </div>
      
      {/* Title below poster (visible on mobile) */}
      <div className="mt-2 lg:hidden">
        <h4 className="text-white font-semibold text-sm line-clamp-2">{movie.title}</h4>
      </div>
    </div>
  );
}
