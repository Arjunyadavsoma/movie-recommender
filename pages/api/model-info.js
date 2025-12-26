import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const modelPath = path.join(process.cwd(), 'public', 'models', 'recommendation_model.json');
    
    // Check if file exists
    if (!fs.existsSync(modelPath)) {
      return res.status(404).json({ 
        error: 'Model file not found',
        metadata: null,
        fileSize: null
      });
    }
    
    // Get file stats
    const stats = fs.statSync(modelPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Read just the metadata (not the entire file for performance)
    const rawData = fs.readFileSync(modelPath, 'utf-8');
    const model = JSON.parse(rawData);
    
    return res.status(200).json({
      metadata: model.metadata || {},
      fileSize: `${fileSizeMB} MB`,
      totalMovies: model.titles?.length || 0,
      lastModified: stats.mtime.toISOString(),
      modelLoaded: true
    });
    
  } catch (error) {
    console.error('Model info error:', error);
    return res.status(500).json({ 
      error: 'Failed to load model info',
      message: error.message 
    });
  }
}
