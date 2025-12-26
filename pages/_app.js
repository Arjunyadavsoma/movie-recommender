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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);
  
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
      {/* Mobile-Optimized Navigation */}
      <nav className="sticky top-0 z-50 bg-dark-bg/98 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto">
          {/* Main Header Bar - Always Visible */}
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            
            {/* Logo - Mobile Optimized */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer group">
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">
                  🎬
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-netflix">
                  MovieRec
                </h1>
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
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* User Avatar - Desktop */}
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
                  
                  {/* Sign Out - Desktop */}
                  <button 
                    onClick={handleSignOut}
                    className="hidden md:block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 text-sm font-medium"
                  >
                    Sign Out
                  </button>

                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-white hover:text-netflix transition-colors relative"
                    aria-label="Toggle menu"
                  >
                    <div className="w-6 h-6 flex flex-col justify-center items-center">
                      <span className={`bg-current h-0.5 w-6 rounded transition-all duration-300 ${
                        mobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'
                      }`} />
                      <span className={`bg-current h-0.5 w-6 rounded transition-all duration-300 ${
                        mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                      }`} />
                      <span className={`bg-current h-0.5 w-6 rounded transition-all duration-300 ${
                        mobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'
                      }`} />
                    </div>
                  </button>
                </>
              ) : (
                <>
                  {/* Sign In Button - Visible on all screens */}
                  <button 
                    onClick={handleSignIn}
                    className="px-4 sm:px-6 py-2 bg-netflix hover:bg-red-700 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                  >
                    Sign In
                  </button>
                  
                  {/* Mobile Menu Toggle for non-logged in users */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-white hover:text-netflix transition-colors"
                    aria-label="Toggle menu"
                  >
                    <div className="w-6 h-6 flex flex-col justify-center items-center">
                      <span className={`bg-current h-0.5 w-6 rounded transition-all duration-300 ${
                        mobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'
                      }`} />
                      <span className={`bg-current h-0.5 w-6 rounded transition-all duration-300 ${
                        mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                      }`} />
                      <span className={`bg-current h-0.5 w-6 rounded transition-all duration-300 ${
                        mobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'
                      }`} />
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Out Menu */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div 
          className={`absolute right-0 top-16 bottom-0 w-80 max-w-[85vw] bg-card-bg border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto">
            {/* User Info Section */}
            {user && (
              <div className="p-6 border-b border-gray-800 bg-gradient-to-br from-netflix/10 to-transparent">
                <div className="flex items-center space-x-4">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'}
                      className="w-16 h-16 rounded-full border-3 border-netflix shadow-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg truncate">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Links */}
            <div className="py-4">
              <Link href="/">
                <div 
                  className={`flex items-center px-6 py-4 transition-colors cursor-pointer ${
                    router.pathname === '/' 
                      ? 'bg-netflix/20 text-netflix border-l-4 border-netflix' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-2xl mr-4">🏠</span>
                  <span className="font-semibold text-lg">Home</span>
                </div>
              </Link>
              
              {user && (
                <Link href="/watchlist">
                  <div 
                    className={`flex items-center px-6 py-4 transition-colors cursor-pointer ${
                      router.pathname === '/watchlist' 
                        ? 'bg-netflix/20 text-netflix border-l-4 border-netflix' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl mr-4">📝</span>
                    <span className="font-semibold text-lg">My Watchlist</span>
                  </div>
                </Link>
              )}
              
              <Link href="/about">
                <div 
                  className={`flex items-center px-6 py-4 transition-colors cursor-pointer ${
                    router.pathname === '/about' 
                      ? 'bg-netflix/20 text-netflix border-l-4 border-netflix' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-2xl mr-4">ℹ️</span>
                  <span className="font-semibold text-lg">About</span>
                </div>
              </Link>
            </div>
            
            {/* Sign Out Button */}
            {user && (
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800 bg-dark-bg">
                <button 
                  onClick={handleSignOut}
                  className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-semibold flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
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
                
                <div>
                  <Link href="/about">
                    <a className="text-gray-400 hover:text-white transition-colors underline">
                      Learn more about MovieRec AI
                    </a>
                  </Link>
                </div>
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
