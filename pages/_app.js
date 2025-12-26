import { useState, useEffect } from 'react';
import { onAuthChange, signInWithGoogle, signOut } from '../lib/firebase';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-pulse text-white text-xl">Loading MovieRec...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🎬</span>
              <h1 className="text-2xl font-bold text-netflix">MovieRec</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full border-2 border-netflix"
                      />
                    )}
                    <span className="text-sm text-gray-300 hidden sm:block">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleSignIn}
                  className="px-6 py-2 bg-netflix hover:bg-red-700 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      {user ? (
        <Component {...pageProps} user={user} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center max-w-md">
            <h2 className="text-4xl font-bold mb-4 text-white">Welcome to MovieRec</h2>
            <p className="text-gray-400 text-lg mb-8">
              Discover your next favorite movie with AI-powered recommendations
            </p>
            <div className="flex justify-center space-x-4 text-5xl mb-8">
              <span className="animate-bounce">🎥</span>
              <span className="animate-bounce delay-100">🍿</span>
              <span className="animate-bounce delay-200">🎬</span>
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
