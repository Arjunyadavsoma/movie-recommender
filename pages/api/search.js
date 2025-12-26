import path from 'path';
import fs from 'fs';

let titlesCache = null;

function loadTitles() {
  if (titlesCache) return titlesCache;
  
  try {
    const modelPath = path.join(process.cwd(), 'public', 'models', 'recommendation_model.json');
    const model = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
    titlesCache = model.titles;
    return titlesCache;
  } catch (error) {
    console.error('Error loading titles:', error);
    throw new Error('Failed to load movie titles');
  }
}

export default function handler(req, res) {
  const { query, limit = 10 } = req.query;
  
  if (!query || query.length < 2) {
    return res.status(400).json({ 
      error: 'Query must be at least 2 characters' 
    });
  }
  
  try {
    const titles = loadTitles();
    const searchQuery = query.toLowerCase();
    
    // Simple fuzzy search - prioritize starts-with matches
    const startsWithMatches = titles.filter(title => 
      title.toLowerCase().startsWith(searchQuery)
    );
    
    const containsMatches = titles.filter(title => 
      !title.toLowerCase().startsWith(searchQuery) && 
      title.toLowerCase().includes(searchQuery)
    );
    
    const allMatches = [...startsWithMatches, ...containsMatches]
      .slice(0, parseInt(limit));
    
    return res.status(200).json({ 
      query,
      count: allMatches.length,
      results: allMatches 
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: error.message });
  }
}
