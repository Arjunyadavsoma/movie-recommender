import path from 'path';
import fs from 'fs';

// Global cache for model artifacts (persists across invocations)
let modelCache = null;

function loadModel() {
  if (modelCache) {
    console.log('Using cached model');
    return modelCache;
  }
  
  try {
    const modelPath = path.join(process.cwd(), 'public', 'models', 'recommendation_model.json');
    const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
    
    modelCache = modelData;
    console.log(`Model loaded: ${modelData.titles.length} movies`);
    return modelCache;
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Failed to load recommendation model');
  }
}

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { movieTitle, topN = 10 } = req.body;
  
  if (!movieTitle) {
    return res.status(400).json({ error: 'movieTitle is required' });
  }
  
  try {
    const model = loadModel();
    const { indices, top_indices, titles, ids } = model;
    
    // Find movie index (case-insensitive match)
    const movieIndex = indices[movieTitle];
    
    if (movieIndex === undefined) {
      // Try fuzzy match
      const fuzzyMatch = titles.find(
        t => t.toLowerCase() === movieTitle.toLowerCase()
      );
      
      if (!fuzzyMatch) {
        return res.status(404).json({ 
          error: 'Movie not found',
          suggestion: 'Try using the search API first'
        });
      }
      
      return handler(req, { ...res, body: { ...req.body, movieTitle: fuzzyMatch } });
    }
    
    // Get precomputed recommendations
    const recommendedIndices = top_indices[movieIndex].slice(0, topN);
    
    const recommendations = recommendedIndices.map(idx => ({
      title: titles[idx],
      id: ids[idx]
    }));
    
    return res.status(200).json({ 
      query: movieTitle,
      recommendations 
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
