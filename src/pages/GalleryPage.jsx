import React, { useState, useEffect } from 'react';
import '../App.css'; 
import GameCard from '../components/GameCard';

// This is our temporary API key.
// In a real app, this would be in a .env file, but the proxy handles it for now.
const apiKey = '89b79a0a975f4f7585a142edaa0974ea';

export function GalleryPage() {
  // --- State ---
  // 'games' will hold our array of games from the API
  // 'loading' will show a message while we fetch
  // 'error' will show a message if the fetch fails
  const [games, setGames] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  // This 'useEffect' hook runs once when the component first loads
  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        // We use our '/api' proxy from vite.config.js
        // We fetch 20 games, sorted by popularity
        const response = await fetch(`/api/games?key=${apiKey}&page_size=20&ordering=-added`); 

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // The API returns data in an object with a 'results' array
        setGames(data.results); 
        setError(null);
      } catch (error) {
        console.error("Could not fetch games:", error);
        setError("Failed to load games. Please try again.");
      } finally {
        setLoading(false); // Always stop loading, even if we failed
      }
    }
    
    fetchGames();
  }, []);

  // --- Render Logic ---
  const renderContent = () => {
    if (loading) {
      return <p className="loading-message">Loading games...</p>;
    }

    if (error) {
      return <p className="error-message">{error}</p>;
    }

    return (
      <div id="game-gallery-container">
        {games.map(game => (
          <GameCard 
            key={game.id} 
            game={game} 
            // This is a temporary click handler
            onGameClick={() => console.log('Clicked', game.name)} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <h1 className="main-title">Game Gallery</h1>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}