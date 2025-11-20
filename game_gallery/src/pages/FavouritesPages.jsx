import React, { useState, useEffect } from 'react';
import '../App.css'; 
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal';

// --- THIS IS YOUR NEW CURATED LIST ---
const FAVORITE_GAME_IDS = [
  3328,   // The Witcher 3: Wild Hunt
  13536,  // Portal
  4200,   // Portal 2
  22121,  // Celeste
  9767,   // Hollow Knight
  292844,  // Hollow Knight: Silksong
  766,  // Warframe
  32,     // Destiny 2
  58764, // The Outer Wilds
  650649, // Outer Wilds: Echoes of the Eye 
  772603, // Chants of Sennaar
  983210,// Clair Obscur: Expedition 33
  274755,  // Hades
  891238, // Hades II
  29236,   // Tunic
  22509 // Minecraft
];

// This is a new, self-contained page
export function FavouritesPage({ apiKey, onBack }) {
  const [favGames, setFavGames] = useState([]); // Stores the full game objects
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState(null);

  useEffect(() => {
    setLoading(true);

    const fetchGameDetails = async (id) => {
      const response = await fetch(`/api/games/${id}?key=${apiKey}`);
      if (!response.ok) {
        console.error(`Failed to fetch game ${id}`);
        return null; 
      }
      return response.json();
    };

    const promises = FAVORITE_GAME_IDS.map(id => fetchGameDetails(id));

    Promise.all(promises)
      .then(results => {
        setFavGames(results.filter(game => game !== null));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching favorites details", err);
        setLoading(false);
      });

  }, [apiKey]); 

  const handleGameClick = (game) => setSelectedGameId(game.id);
  const handleCloseModal = () => setSelectedGameId(null);

  const renderContent = () => {
    if (loading) {
      return <p className="loading-message">Loading our top picks...</p>;
    }
    if (favGames.length === 0) {
      return <p className="loading-message">Could not load favorites.</p>;
    }
    return (
      <div id="game-gallery-container">
        {favGames.map(game => (
          <GameCard key={game.id} game={game} onGameClick={handleGameClick} />
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <div className="header-container">
        <h1 className="main-title" onClick={onBack}>
          &larr; Back to Gallery
        </h1>
      </div>

      <main>{renderContent()}</main>

      {selectedGameId && (
        <GameModal 
          gameId={selectedGameId} 
          apiKey={apiKey}
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}