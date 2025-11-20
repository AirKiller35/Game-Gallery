import React, { useState } from 'react';
import { useAuth } from '../authContext'; 
import '../App.css'; 

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { login, register, loginAsGuest } = useAuth(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      register(username, email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        <h1 className="main-title">Game Gallery</h1>
        <h2>{isRegistering ? 'Register' : 'Sign In'}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          
          {/* Only show username field if registering */}
          {isRegistering && (
            <input 
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">
            {isRegistering ? 'Register' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          className="toggle-auth-button"
        >
          {isRegistering ? 'Have an account? Sign In' : "Don't have an account? Register"}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button 
          onClick={loginAsGuest} 
          className="guest-button"
        >
          Enter as Guest
        </button>

      </div>
    </div>
  );
}