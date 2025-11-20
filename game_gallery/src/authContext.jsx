import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:3001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load session from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        localStorage.clear();
      }
    } else {
      localStorage.clear();
    }
    setAuthLoading(false);
  }, []);

  // Save session to localStorage on change
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else if (!authLoading) { 
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token, authLoading]);

  // --- Real API Calls ---

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Login failed');
      }

      const data = await response.json();
      // Server returns { token, user }
      setUser(data.user);
      setToken(data.token);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const loginAsGuest = () => {
    setUser({ name: "Guest", isGuest: true });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const deleteAccount = async () => {
    if (!token) {
      alert("Error: No valid token found. Please log in again.");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token // Send token to prove identity
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Failed to delete account');
      }

      alert('Account deleted successfully.');
      logout(); 
      
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const value = {
    user,
    token,
    isLoggedIn: !!user,
    isGuest: user?.isGuest || false,
    authLoading,
    login,
    register,
    loginAsGuest,
    logout,
    deleteAccount
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