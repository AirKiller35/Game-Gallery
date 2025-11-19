import React, { useState, useEffect } from 'react';
import '../App.css'; 
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal'; // Import the new modal

const GAMES_PER_PAGE = 20;
const apiKey = '89b79a0a975f4f7585a142edaa0974ea';

export function GalleryPage() {
  // --- State ---
  const [games, setGames] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- NEW STATE for Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // --- NEW STATE for Modal ---
  // When this is null, the modal is closed. When it's a game ID, it's open.
  const [selectedGameId, setSelectedGameId] = useState(null);

  // --- Data Fetching ---
  // This 'useEffect' hook now re-runs when 'currentPage' changes
  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        setError(null);

        // We now add the 'page' parameter to our API call
        const response = await fetch(
          `/api/games?key=${apiKey}&page_size=${GAMES_PER_PAGE}&ordering=-added&page=${currentPage}`
        ); 

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        setGames(data.results); 
        // We get the total 'count' from the API to calculate total pages
        setTotalPages(Math.ceil(data.count / GAMES_PER_PAGE));

      } catch (error) {
        console.error("Could not fetch games:", error);
        setError("Failed to load games. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchGames(); 
  }, [currentPage]); // Re-run this effect when 'currentPage' changes

  // --- NEW HANDLERS ---
  const handleGameClick = (game) => {
    setSelectedGameId(game.id);
  };

  const handleCloseModal = () => {
    setSelectedGameId(null);
  };

  const goToNextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

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
            // Pass the new click handler to the card
            onGameClick={handleGameClick} 
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

      {/* --- NEW PAGINATION CONTROLS --- */}
      {/* Only show pagination if not loading and we have games */}
      {!loading && !error && games.length > 0 && (
        <div className="pagination-container">
          <button 
            onClick={goToPrevPage} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* --- NEW MODAL RENDER --- */}
      {/* Conditionally render the modal if a game ID is selected */}
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