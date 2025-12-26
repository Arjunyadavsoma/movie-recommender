import { useState, useEffect } from 'react';
import { onAuthChange, signInWithGoogle, signOut } from '../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
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
    <div className="min-h-screen bg-dark-bg">
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
            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/">
                  <span className={`cursor-pointer hover:text-netflix transition-colors duration-200 ${
                    router.pathname === '/' ? 'text-netflix font-semibold' : 'text-gray-300'
                  }`}>
                    🏠 Home
                  </span>
                </Link>
                <Link href="/watchlist">
                  <span className={`cursor-pointer hover:text-netflix transition-colors duration-200 ${
                    router.pathname === '/watchlist' ? 'text-netflix font-semibold' : 'text-gray-300'
                  }`}>
                    📝 Watchlist
                  </span>
                </Link>
              </div>
            )}
            
            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden text-white"
                  >
                    {mobileMenuOpen ? '✕' : '☰'}
                  </button>
                  
                  {/* User Info */}
                  <div className="hidden md:flex items-center space-x-3">
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full border-2 border-netflix"
                      />
                    )}
                    <span className="text-sm text-gray-300 hidden lg:block">
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
          {mobileMenuOpen && user && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-800">
              <Link href="/">
                <div 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 px-4 rounded ${
                    router.pathname === '/' ? 'bg-netflix text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  🏠 Home
                </div>
              </Link>
              <Link href="/watchlist">
                <div 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 px-4 rounded ${
                    router.pathname === '/watchlist' ? 'bg-netflix text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  📝 Watchlist
                </div>
              </Link>
              <div className="flex items-center space-x-3 py-2 px-4">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border-2 border-netflix"
                  />
                )}
                <span className="text-sm text-gray-300">
                  {user.displayName || user.email}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full text-left py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
      
      {/* Main Content */}
      {user ? (
        <Component {...pageProps} user={user} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center max-w-md">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-netflix to-red-400 bg-clip-text text-transparent">
              Welcome to MovieRec
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Discover your next favorite movie with AI-powered recommendations
            </p>
            <div className="flex justify-center space-x-4 text-5xl mb-8 animate-bounce">
              🎥 🍿 🎬
            </div>
            <button
              onClick={handleSignIn}
              className="px-8 py-4 bg-netflix hover:bg-red-700 text-white font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
