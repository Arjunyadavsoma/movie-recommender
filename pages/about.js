import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function About() {
  const router = useRouter();
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const res = await fetch('/api/model-info');
      const data = await res.json();
      setModelInfo(data);
    } catch (error) {
      console.error('Failed to load model info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>About - MovieRec AI</title>
        <meta name="description" content="Learn about MovieRec AI - an ML-powered movie recommendation system" />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-netflix via-red-800 to-dark-bg py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About MovieRec AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              AI-Powered Movie Recommendations Using Machine Learning
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Project Overview */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="text-4xl mr-3">🎬</span>
              What is MovieRec?
            </h2>
            <div className="bg-card-bg border border-gray-800 rounded-xl p-8">
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                MovieRec is an intelligent movie recommendation platform powered by advanced machine learning algorithms. 
                Unlike simple genre-based systems, our AI analyzes multiple features including plot descriptions, genres, 
                keywords, cast, crew, and production companies to find movies that truly match your taste.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Built as a full-stack project combining cutting-edge ML with modern web technologies, MovieRec demonstrates 
                how AI can enhance entertainment discovery while maintaining fast, responsive performance.
              </p>
            </div>
          </section>

          {/* ML Model Stats */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="text-4xl mr-3">🤖</span>
              Machine Learning Model
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Model Info Card */}
              <div className="bg-gradient-to-br from-purple-900/30 to-card-bg border border-purple-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-4">Model Specifications</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-800 rounded shimmer"></div>
                    ))}
                  </div>
                ) : modelInfo ? (
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Total Movies:</span>
                      <span className="font-bold text-white">
                        {modelInfo.metadata?.total_movies?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model Size:</span>
                      <span className="font-bold text-white">{modelInfo.fileSize || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-bold text-white">{modelInfo.metadata?.version || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coverage:</span>
                      <span className="font-bold text-white">
                        {modelInfo.metadata?.min_year || '1970'} - 2024
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Filter:</span>
                      <span className="font-bold text-white">
                        {modelInfo.metadata?.min_vote_count || '30'}+ votes
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Failed to load model info</p>
                )}
              </div>

              {/* Training Info Card */}
              <div className="bg-gradient-to-br from-blue-900/30 to-card-bg border border-blue-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Training Details</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-800 rounded shimmer"></div>
                    ))}
                  </div>
                ) : modelInfo ? (
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span className="font-bold text-white">TF-IDF + Cosine Similarity</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Features:</span>
                      <span className="font-bold text-white">
                        {modelInfo.metadata?.tfidf_features?.toLocaleString() || '8,000'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommendations/Movie:</span>
                      <span className="font-bold text-white">
                        Top {modelInfo.metadata?.top_n_similar || '10'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dataset:</span>
                      <span className="font-bold text-white">
                        {modelInfo.metadata?.dataset || 'Kaggle TMDB'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trained:</span>
                      <span className="font-bold text-white">
                        {modelInfo.metadata?.trained_at 
                          ? new Date(modelInfo.metadata.trained_at).toLocaleDateString()
                          : 'Recently'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Failed to load training info</p>
                )}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-card-bg border border-gray-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">How It Works</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start">
                  <span className="text-2xl mr-4">1️⃣</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Feature Extraction</h4>
                    <p>The model analyzes movie titles, overviews, genres, keywords, cast, directors, and production companies to create a comprehensive feature profile.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4">2️⃣</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">TF-IDF Vectorization</h4>
                    <p>Text features are converted into numerical vectors using TF-IDF (Term Frequency-Inverse Document Frequency), weighing important terms while filtering common words.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4">3️⃣</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Similarity Computation</h4>
                    <p>Cosine similarity measures how closely movies align in the vector space, with scores from 0 (completely different) to 1 (identical).</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-4">4️⃣</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Smart Recommendations</h4>
                    <p>The top 10 most similar movies are pre-computed and stored, enabling instant recommendations with rich metadata.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="text-4xl mr-3">⚙️</span>
              Technology Stack
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Frontend */}
              <div className="bg-card-bg border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Frontend</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Next.js 13 (React)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Tailwind CSS</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Firebase Auth</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>TMDB API Integration</span>
                  </li>
                </ul>
              </div>

              {/* Backend */}
              <div className="bg-card-bg border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4">Backend</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Next.js API Routes</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Serverless Functions</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Firebase Firestore</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Node.js Runtime</span>
                  </li>
                </ul>
              </div>

              {/* ML & Data */}
              <div className="bg-card-bg border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-4">ML & Data</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Python 3.11</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>scikit-learn</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Pandas & NumPy</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">▹</span>
                    <span>Kaggle TMDB Dataset</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="text-4xl mr-3">✨</span>
              Key Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card-bg border border-gray-800 rounded-xl p-6 hover:border-netflix transition-colors">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Recommendations</h3>
                <p className="text-gray-300">
                  AI-powered suggestions based on content similarity, not just genres. Find hidden gems that match your taste.
                </p>
              </div>

              <div className="bg-card-bg border border-gray-800 rounded-xl p-6 hover:border-netflix transition-colors">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-300">
                  Pre-computed recommendations deliver results in milliseconds. No waiting for AI to think!
                </p>
              </div>

              <div className="bg-card-bg border border-gray-800 rounded-xl p-6 hover:border-netflix transition-colors">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">Personal Watchlist</h3>
                <p className="text-gray-300">
                  Save movies you want to watch. Sync across devices with Firebase authentication.
                </p>
              </div>

              <div className="bg-card-bg border border-gray-800 rounded-xl p-6 hover:border-netflix transition-colors">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
                <p className="text-gray-300">
                  Instant autocomplete across {modelInfo?.metadata?.total_movies?.toLocaleString() || '32,000+'} movies. Find exactly what you're looking for.
                </p>
              </div>

              <div className="bg-card-bg border border-gray-800 rounded-xl p-6 hover:border-netflix transition-colors">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-xl font-bold text-white mb-2">Rich Metadata</h3>
                <p className="text-gray-300">
                  View ratings, genres, runtime, cast, crew, and detailed descriptions for every movie.
                </p>
              </div>

              <div className="bg-card-bg border border-gray-800 rounded-xl p-6 hover:border-netflix transition-colors">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="text-xl font-bold text-white mb-2">Fully Responsive</h3>
                <p className="text-gray-300">
                  Seamless experience on desktop, tablet, and mobile. Discover movies anywhere.
                </p>
              </div>
            </div>
          </section>

          {/* Performance Stats */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="text-4xl mr-3">📊</span>
              Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-900/30 to-card-bg border border-green-700/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {modelInfo?.fileSize || '6.75 MB'}
                </div>
                <div className="text-gray-400 text-sm">Model Size</div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/30 to-card-bg border border-blue-700/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">&lt;100ms</div>
                <div className="text-gray-400 text-sm">Response Time</div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-card-bg border border-purple-700/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">99.97%</div>
                <div className="text-gray-400 text-sm">Compression</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/30 to-card-bg border border-yellow-700/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {modelInfo?.metadata?.total_movies 
                    ? (modelInfo.metadata.total_movies * 10).toLocaleString()
                    : '320K+'}
                </div>
                <div className="text-gray-400 text-sm">Similarity Scores</div>
              </div>
            </div>
          </section>

          {/* Developer Info */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <span className="text-4xl mr-3">👨‍💻</span>
              Built By
            </h2>
            
            <div className="bg-gradient-to-br from-netflix/20 to-card-bg border border-netflix/50 rounded-xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-netflix to-red-600 flex items-center justify-center text-4xl font-bold text-white">
                    SY
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-bold text-white mb-2">Soma Arjun Yadav</h3>
                  <p className="text-xl text-gray-400 mb-4">B.Tech AI & ML Student • Class of 2027</p>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Passionate full-stack developer and ML enthusiast skilled in Flutter, React Native, Next.js, 
                    and AI integrations. Building scalable applications that bridge modern web technologies with 
                    machine learning solutions.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <a 
                      href="https://github.com/yourusername" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                    
                    <a 
                      href="https://linkedin.com/in/yourprofile" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                    
                    <a 
                      href="mailto:your.email@example.com"
                      className="px-6 py-3 bg-netflix hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-800">
                <h4 className="text-lg font-bold text-white mb-3">Skills & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'JavaScript', 'React/Next.js', 'Flutter', 'Firebase', 'Machine Learning', 
                    'TensorFlow', 'scikit-learn', 'Node.js', 'Tailwind CSS', 'Git', 'REST APIs'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-netflix to-red-700 rounded-xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Discover Your Next Favorite Movie?
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Let our AI help you find movies you'll love
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-white text-netflix font-bold rounded-lg text-lg hover:bg-gray-100 transition-colors transform hover:scale-105 duration-200"
              >
                Start Exploring
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
