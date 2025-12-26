export default async function handler(req, res) {
  const { genre, minRating, sortBy, timeWindow = 'day' } = req.query;
  
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    let movies = data.results || [];
    
    // Apply filters
    if (genre && genre !== 'All') {
      const genreMap = {
        'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
        'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
        'Fantasy': 14, 'Horror': 27, 'Mystery': 9648, 'Romance': 10749,
        'Sci-Fi': 878, 'Thriller': 53, 'War': 10752
      };
      const genreId = genreMap[genre];
      movies = movies.filter(m => m.genre_ids?.includes(genreId));
    }
    
    if (minRating) {
      movies = movies.filter(m => m.vote_average >= parseFloat(minRating));
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      movies.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortBy === 'recent') {
      movies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (sortBy === 'title') {
      movies.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    res.status(200).json({ results: movies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
