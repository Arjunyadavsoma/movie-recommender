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
    const similar = await getSimilarMovies(id, 12);
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
      <div className="min-h-screen flex items-center justify-center px-4">
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
        {/* MOBILE-OPTIMIZED Hero Section - NO OVERLAP */}
        <div className="relative">
          {/* Backdrop Image - Taller height, stronger gradient */}
          <div 
            className="h-[55vh] sm:h-[60vh] md:h-[70vh] lg:h-[75vh] bg-cover bg-center relative"
            style={{ backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})` }}
          >
            {/* Stronger Gradient Overlay - Prevents header blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-dark-bg/30 sm:to-transparent" />
            
            {/* Back Button - Clearly visible */}
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-2 sm:px-4 sm:py-2.5 bg-black/80 hover:bg-black/95 backdrop-blur-md text-white rounded-lg transition-all duration-200 flex items-center gap-2 z-20 group shadow-xl"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>

            {/* Content - More padding at bottom for mobile */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 pb-8 sm:pb-10">
              <div className="max-w-7xl mx-auto">
                
                {/* Layout: Vertical on mobile, Horizontal on desktop */}
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-8 items-center sm:items-end">
                  
                  {/* Poster - Slightly larger on mobile, centered */}
                  <div className="flex-shrink-0">
                    <img 
                      src={getImageUrl(movie.poster_path, 'w342')}
                      alt={movie.title}
                      className="w-36 h-54 sm:w-40 sm:h-60 md:w-52 md:h-78 lg:w-64 lg:h-96 rounded-lg shadow-2xl border-2 sm:border-3 border-white/30 object-cover"
                    />
                  </div>
                  
                  {/* Info - Better spacing */}
                  <div className="flex-1 text-center sm:text-left min-w-0 space-y-3 sm:space-y-4">
                    
                    {/* Title - Responsive sizing */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white drop-shadow-2xl leading-tight line-clamp-3">
                      {movie.title}
                    </h1>
                    
                    {/* Meta Info - All visible on mobile */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                        <span className="text-yellow-400 text-lg sm:text-xl md:text-2xl">⭐</span>
                        <span className="text-white font-bold text-sm sm:text-base md:text-lg">{movie.vote_average?.toFixed(1)}</span>
                      </div>
                      
                      {/* Year */}
                      <div className="bg-black/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-white font-semibold text-sm sm:text-base shadow-lg">
                        {movie.release_date?.split('-')[0]}
                      </div>
                      
                      {/* Runtime - Always visible */}
                      <div className="bg-black/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-white text-sm sm:text-base shadow-lg">
                        {runtime}
                      </div>
                    </div>

                    {/* Action Buttons - Better mobile layout */}
                    <div className="flex flex-col xs:flex-row gap-3 pt-2">
                      
                      {/* Trailer Button */}
                      {trailerKey && (
                        <button
                          onClick={() => setShowTrailer(true)}
                          className="w-full xs:w-auto px-6 py-3 bg-white hover:bg-gray-100 text-dark-bg font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          <span className="text-sm sm:text-base">Watch Trailer</span>
                        </button>
                      )}
                      
                      {/* Watchlist Button */}
                      <button
                        onClick={toggleWatchlist}
                        disabled={watchlistLoading || checkingWatchlist || !user}
                        className={`w-full xs:w-auto px-6 py-3 font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 ${
                          inWatchlist 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {watchlistLoading || checkingWatchlist ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm sm:text-base">Loading...</span>
                          </>
                        ) : inWatchlist ? (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm sm:text-base">In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm sm:text-base">Add to List</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trailer Modal - Optimized for Mobile */}
        {showTrailer && trailerKey && (
          <div 
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowTrailer(false)}
          >
            <div className="relative w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-8 sm:-top-12 right-0 text-white hover:text-netflix transition-colors p-2"
                aria-label="Close trailer"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12">
          
          {/* Genres */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span 
                  key={genre.id} 
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors duration-200 text-sm sm:text-base font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs - Horizontal Scroll on Mobile */}
          <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8 border-b border-gray-800 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            {[
              { id: 'overview', label: 'Overview', icon: '📖' },
              { id: 'cast', label: 'Cast', icon: '🎭' },
              { id: 'details', label: 'Details', icon: 'ℹ️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 sm:pb-4 text-sm sm:text-base md:text-lg font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-netflix border-b-2 border-netflix'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="hidden xs:inline">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 md:mb-4">📖 Storyline</h3>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">{movie.overview}</p>
                </div>

                {movie.tagline && (
                  <div className="p-4 sm:p-6 bg-card-bg border-l-4 border-netflix rounded-lg">
                    <p className="text-base sm:text-lg md:text-xl italic text-gray-300">"{movie.tagline}"</p>
                  </div>
                )}

                {/* Quick Facts on Mobile */}
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                  <div className="bg-card-bg p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Runtime</p>
                    <p className="text-white font-semibold text-sm">{runtime}</p>
                  </div>
                  <div className="bg-card-bg p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Status</p>
                    <p className="text-white font-semibold text-sm">{movie.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cast Tab */}
            {activeTab === 'cast' && (
              <div className="animate-fadeIn">
                
                {/* Director */}
                {movie.credits?.crew && (
                  <div className="mb-6 sm:mb-8">
                    <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-400 mb-3 sm:mb-4">🎬 Director</h4>
                    <div className="flex flex-wrap gap-4">
                      {movie.credits.crew
                        .filter(person => person.job === 'Director')
                        .map((director) => (
                          <div key={director.id} className="text-center">
                            <img
                              src={getImageUrl(director.profile_path, 'w185')}
                              alt={director.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover mb-2 border-2 border-netflix shadow-lg"
                            />
                            <p className="text-white font-semibold text-xs sm:text-sm md:text-base max-w-[100px] mx-auto">{director.name}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Cast - Horizontal Scroll on Mobile */}
                <div>
                  <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-400 mb-3 sm:mb-4">🎭 Cast</h4>
                  <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-2">
                    <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                      {movie.credits?.cast?.slice(0, 15).map((person) => (
                        <div key={person.id} className="group flex-shrink-0 w-28 sm:w-auto">
                          <div className="relative overflow-hidden rounded-lg mb-2 shadow-lg">
                            <img
                              src={getImageUrl(person.profile_path, 'w185')}
                              alt={person.name}
                              className="w-full h-36 sm:h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <p className="text-white font-semibold text-xs sm:text-sm line-clamp-2">{person.name}</p>
                          <p className="text-gray-400 text-xs line-clamp-1">{person.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-fadeIn">
                <DetailRow label="Status" value={movie.status} />
                <DetailRow label="Release Date" value={new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                <DetailRow label="Runtime" value={runtime} />
                <DetailRow label="Budget" value={movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A'} />
                <DetailRow label="Revenue" value={revenue} />
                <DetailRow label="Language" value={movie.original_language?.toUpperCase()} />
                
                <div className="pt-3 sm:pt-4 md:pt-6 border-t border-gray-800">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-400 mb-2 sm:mb-3">Production Companies</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.production_companies?.map((company) => (
                      <span key={company.id} className="px-3 py-1.5 bg-card-bg rounded-lg text-gray-300 text-xs sm:text-sm">
                        {company.name}
                      </span>
                    ))}
                  </div>
                </div>

                {movie.homepage && (
                  <div className="pt-3 sm:pt-4">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-400 mb-2">Official Website</h4>
                    <a 
                      href={movie.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-netflix hover:underline text-sm sm:text-base break-all inline-flex items-center gap-2"
                    >
                      <span>Visit Website</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Movies - Full Width Background */}
        {similarMovies.length > 0 && (
          <div className="bg-card-bg py-6 sm:py-10 md:py-12 mt-6 sm:mt-10">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                  <span>🎬</span>
                  <span>More Like This</span>
                </h3>
                <span className="text-gray-400 text-xs sm:text-sm font-medium">{similarMovies.length} movies</span>
              </div>

              {loadingSimilar ? (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="shimmer rounded-lg h-56 sm:h-64 md:h-80"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                  {similarMovies.map((similarMovie) => (
                    <SimilarMovieCard 
                      key={similarMovie.id}
                      movie={similarMovie}
                      onNavigate={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        router.push(`/movie/${similarMovie.id}`);
                      }}
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

// Optimized Detail Row Component
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2 sm:py-3 border-b border-gray-800 gap-4">
      <span className="text-gray-400 font-semibold text-xs sm:text-sm md:text-base flex-shrink-0">{label}</span>
      <span className="text-white text-xs sm:text-sm md:text-base text-right">{value}</span>
    </div>
  );
}

// Optimized Similar Movie Card Component
function SimilarMovieCard({ movie, onNavigate }) {
  return (
    <div 
      onClick={onNavigate}
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <div className="relative rounded-lg overflow-hidden shadow-lg">
        <img 
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-bold text-yellow-400 shadow-lg">
          ⭐ {movie.vote_average?.toFixed(1)}
        </div>
        
        {/* Hover Overlay - Desktop Only */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-3">
          <h4 className="font-bold text-sm mb-1 line-clamp-2 text-white">{movie.title}</h4>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-yellow-400">⭐ {movie.vote_average?.toFixed(1)}</span>
            <span className="text-gray-300">{movie.release_date?.split('-')[0]}</span>
          </div>
          <p className="text-xs text-gray-300 line-clamp-2">{movie.overview}</p>
        </div>
      </div>
      
      {/* Mobile: Title Below Poster */}
      <div className="mt-2 md:hidden">
        <h4 className="text-white font-semibold text-xs leading-tight line-clamp-2 mb-0.5">{movie.title}</h4>
        <span className="text-gray-400 text-xs">{movie.release_date?.split('-')[0]}</span>
      </div>
    </div>
  );
}
