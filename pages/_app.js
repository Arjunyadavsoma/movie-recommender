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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div>
      <nav style={navStyle}>
        <h1 style={logoStyle}>🎬 MovieRec</h1>
        <div>
          {user ? (
            <>
              <span style={userStyle}>Hi, {user.displayName || user.email}</span>
              <button onClick={handleSignOut} style={buttonStyle}>
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={handleSignIn} style={buttonStyle}>
              Sign In with Google
            </button>
          )}
        </div>
      </nav>
      
      {user ? (
        <Component {...pageProps} user={user} />
      ) : (
        <div style={authPromptStyle}>
          <h2>Welcome to MovieRec</h2>
          <p>Please sign in to get personalized movie recommendations</p>
        </div>
      )}
    </div>
  );
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 30px',
  background: '#141414',
  color: 'white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
};

const logoStyle = {
  margin: 0,
  fontSize: '1.5rem'
};

const userStyle = {
  marginRight: '15px',
  fontSize: '0.9rem'
};

const buttonStyle = {
  padding: '10px 20px',
  background: '#e50914',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '600'
};

const authPromptStyle = {
  textAlign: 'center',
  padding: '100px 20px',
  color: '#666'
};
