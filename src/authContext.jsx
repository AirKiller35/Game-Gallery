import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On app load, check localStorage for a saved session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem('user');
      }
    }
    setAuthLoading(false);
  }, []);

  // Helper to save user state
  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // --- Mock Authentication Functions ---
  
  const login = (email, password) => {
    console.log("Logging in (Mock):", email);
    // Simulate a successful login by creating a user object from the email
    const mockUser = {
      username: email.split('@')[0], // Use part of email as username
      email: email,
      token: 'mock-jwt-token' // Fake token for now
    };
    saveUser(mockUser);
  };

  const register = (username, email, password) => {
    console.log("Registering (Mock):", username, email);
    // Simulate registration
    const mockUser = {
      username: username,
      email: email,
      token: 'mock-jwt-token'
    };
    saveUser(mockUser);
  };

  const loginAsGuest = () => {
    const guestUser = { name: "Guest", isGuest: true };
    saveUser(guestUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isGuest: user?.isGuest || false,
    authLoading,
    login,
    register,
    loginAsGuest,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}