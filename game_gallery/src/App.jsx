import React from 'react';
import './App.css';
import { useAuth, AuthProvider } from './authContext';
import { LoginPage } from './pages/LoginPage';
import { GalleryPage } from './pages/GalleryPage';

// This component checks the auth state and decides which page to show.
function AppContent() {
  const { isLoggedIn, authLoading } = useAuth();

  // Show a loading message while checking localStorage
  if (authLoading) {
    return <div className="loading-message">Checking session...</div>
  }

  // If user is logged in, show the gallery. Otherwise, show login.
  if (isLoggedIn) {
    return <GalleryPage />;
  } else {
    return <LoginPage />;
  }
}

// The main App component wraps everything in the AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;