import { useState, useEffect } from 'react';
import { onAuthChange, signInWithGoogle, signOut } from '../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Footer from '../components/Footer';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in failed:', error);
      alert('Failed to sign in. Please try again.');
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-netflix mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading MovieRec...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer group">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🎬</span>
                <h1 className="text-2xl font-bold text-netflix">MovieRec</h1>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <span className={`cursor-pointer hover:text-netflix transition-colors duration-200 ${
                  router.pathname === '/' ? 'text-netflix font-semibold' : 'text-gray-300'
                }`}>
                  🏠 Home
                </span>
              </Link>
              
              {user && (
                <Link href="/watchlist">
                  <span className={`cursor-pointer hover:text-netflix transition-colors duration-200 ${
                    router.pathname === '/watchlist' ? 'text-netflix font-semibold' : 'text-gray-300'
                  }`}>
                    📝 Watchlist
                  </span>
                </Link>
              )}
              
              <Link href="/about">
                <span className={`cursor-pointer hover:text-netflix transition-colors duration-200 ${
                  router.pathname === '/about' ? 'text-netflix font-semibold' : 'text-gray-300'
                }`}>
                  ℹ️ About
                </span>
              </Link>
            </div>
            
            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden text-white text-2xl p-2"
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? '✕' : '☰'}
                  </button>
                  
                  {/* User Info (Desktop) */}
                  <div className="hidden md:flex items-center space-x-3">
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full border-2 border-netflix"
                      />
                    )}
                    <span className="text-sm text-gray-300 hidden lg:block max-w-[150px] truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleSignOut}
                    className="hidden md:block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleSignIn}
                  className="px-6 py-2 bg-netflix hover:bg-red-700 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-800">
              <Link href="/">
                <div 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 px-4 rounded cursor-pointer ${
                    router.pathname === '/' ? 'bg-netflix text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  🏠 Home
                </div>
              </Link>
              
              {user && (
                <Link href="/watchlist">
                  <div 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 px-4 rounded cursor-pointer ${
                      router.pathname === '/watchlist' ? 'bg-netflix text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    📝 Watchlist
                  </div>
                </Link>
              )}
              
              <Link href="/about">
                <div 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 px-4 rounded cursor-pointer ${
                    router.pathname === '/about' ? 'bg-netflix text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  ℹ️ About
                </div>
              </Link>
              
              {user && (
                <>
                  <div className="flex items-center space-x-3 py-2 px-4 border-t border-gray-800 mt-2 pt-4">
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full border-2 border-netflix"
                      />
                    )}
                    <span className="text-sm text-gray-300 truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-grow">
        {user || router.pathname === '/about' ? (
          <Component {...pageProps} user={user} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="text-center max-w-2xl">
              <div className="mb-8">
                <h2 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-netflix to-red-400 bg-clip-text text-transparent">
                  Welcome to MovieRec
                </h2>
                <p className="text-gray-400 text-lg sm:text-xl mb-4">
                  Discover your next favorite movie with AI-powered recommendations
                </p>
                <p className="text-gray-500 text-sm">
                  🤖 Powered by Machine Learning • 🎬 32,000+ Movies • ⚡ Instant Results
                </p>
              </div>
              
              <div className="flex justify-center space-x-4 text-5xl mb-8 animate-bounce">
                🎥 🍿 🎬
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleSignIn}
                  className="px-8 py-4 bg-netflix hover:bg-red-700 text-white font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🚀 Get Started
                </button>
                
                
              </div>
              
              {/* Features Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                <div className="bg-card-bg border border-gray-800 rounded-lg p-6">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="text-white font-bold mb-2">Smart AI</h3>
                  <p className="text-gray-400 text-sm">
                    Advanced ML algorithms analyze movies to find perfect matches
                  </p>
                </div>
                
                <div className="bg-card-bg border border-gray-800 rounded-lg p-6">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="text-white font-bold mb-2">Instant</h3>
                  <p className="text-gray-400 text-sm">
                    Get recommendations in milliseconds, not minutes
                  </p>
                </div>
                
                <div className="bg-card-bg border border-gray-800 rounded-lg p-6">
                  <div className="text-3xl mb-2">📚</div>
                  <h3 className="text-white font-bold mb-2">Personal</h3>
                  <p className="text-gray-400 text-sm">
                    Save your favorites and build your own watchlist
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
