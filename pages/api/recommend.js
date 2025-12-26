import fs from 'fs';
import path from 'path';

let modelData = null;

function loadModel() {
  if (!modelData) {
    console.log('📥 Loading model with metadata...');
    const startTime = Date.now();
    
    const modelPath = path.join(process.cwd(), 'public', 'models', 'recommendation_model.json');
    const rawData = fs.readFileSync(modelPath, 'utf-8');
    modelData = JSON.parse(rawData);
    
    const loadTime = Date.now() - startTime;
    
    console.log('✅ Model loaded:', {
      movies: modelData.titles?.length || 0,
      version: modelData.metadata?.version,
      hasMetadata: !!modelData.metadata_movies,
      loadTime: `${loadTime}ms`
    });
  }
  return modelData;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const { movieTitle, topN = 10 } = req.body;

    if (!movieTitle) {
      return res.status(400).json({ error: 'Movie title is required' });
    }

    const model = loadModel();
    const movieIndex = model.indices[movieTitle];

    if (movieIndex === undefined) {
      // Find similar titles for suggestions
      const suggestions = Object.keys(model.indices)
        .filter(title => title.toLowerCase().includes(movieTitle.toLowerCase()))
        .slice(0, 5);
      
      return res.status(404).json({
        error: 'Movie not found',
        query: movieTitle,
        suggestions,
        totalMovies: model.titles.length
      });
    }

    // Get recommendations
    const topIndices = model.top_indices[movieIndex];
    const topScores = model.top_scores[movieIndex];

    // Build recommendations with metadata
    const recommendations = topIndices.slice(0, topN).map((idx, i) => ({
      title: model.titles[idx],
      id: model.ids[idx],
      score: topScores[i],
      
      // Rich metadata (NEW!)
      year: model.metadata_movies.years[idx],
      rating: model.metadata_movies.ratings[idx],
      voteCount: model.metadata_movies.vote_counts[idx],
      genres: model.metadata_movies.genres[idx],
      primaryGenre: model.metadata_movies.primary_genres[idx],
      runtime: model.metadata_movies.runtimes[idx],
      language: model.metadata_movies.languages[idx],
      popularity: model.metadata_movies.popularity[idx]
    }));

    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      query: movieTitle,
      recommendations,
      source: 'ml_model',
      model_info: {
        version: model.metadata?.version,
        total_movies: model.titles.length,
        trained_at: model.metadata?.trained_at,
        response_time_ms: responseTime
      }
    });

  } catch (error) {
    console.error('❌ Recommendation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
}
