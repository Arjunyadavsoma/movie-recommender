const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60;

async function fetchWithCache(url, cacheKey) {
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
    cache.delete(cacheKey);
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

export async function searchMovie(title) {
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US`;
  const cacheKey = `search:${title}`;
  
  try {
    const data = await fetchWithCache(url, cacheKey);
    return data.results[0] || null;
  } catch (error) {
    console.error('TMDB search error:', error);
    return null;
  }
}

// NEW: Get trending movies
export async function getTrendingMovies(timeWindow = 'day') {
  const url = `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`;
  const cacheKey = `trending:${timeWindow}`;
  
  try {
    const data = await fetchWithCache(url, cacheKey);
    return data.results || [];
  } catch (error) {
    console.error('TMDB trending error:', error);
    return [];
  }
}

// NEW: Get movie details by ID
export async function getMovieDetails(movieId) {
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`;
  const cacheKey = `movie:${movieId}`;
  
  try {
    return await fetchWithCache(url, cacheKey);
  } catch (error) {
    console.error('TMDB details error:', error);
    return null;
  }
}

// NEW: Get popular movies
export async function getPopularMovies() {
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  const cacheKey = 'popular';
  
  try {
    const data = await fetchWithCache(url, cacheKey);
    return data.results || [];
  } catch (error) {
    console.error('TMDB popular error:', error);
    return [];
  }
}

export function getImageUrl(posterPath, size = 'w500') {
  if (!posterPath) return '/placeholder-movie.png';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

export function getBackdropUrl(backdropPath) {
  if (!backdropPath) return '/placeholder-backdrop.png';
  return `https://image.tmdb.org/t/p/original${backdropPath}`;
}
