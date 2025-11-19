import React, { useState, useEffect } from 'react';

const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

// This modal fetches its own data based on the ID it receives
function GameModal({ gameId, apiKey, onClose }) {
  const [gameDetails, setGameDetails] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This effect fetches the full details for *only* the selected game
  useEffect(() => {
    if (!gameId) return;

   async function fetchAllDetails() {
      setLoading(true);
      setError(null);
      setStores([]); 

      const detailsUrl = `/api/games/${gameId}?key=${apiKey}`;
      const storesUrl = `/api/games/${gameId}/stores?key=${apiKey}`;

      try {
        // Fetch both simultaneously
        const [detailsRes, storesRes] = await Promise.all([
          fetch(detailsUrl),
          fetch(storesUrl)
        ]);

        if (!detailsRes.ok) throw new Error("Failed to fetch game details.");
        if (!storesRes.ok) throw new Error("Failed to fetch store links.");

        const detailsData = await detailsRes.json();
        const storesData = await storesRes.json();

        // Set state for both results
        setGameDetails(detailsData); // Has game info and store *names*
        setStores(storesData.results || []); // Has store *URLs* and IDs
        
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllDetails();
  }, [gameId, apiKey]); // Re-run this fetch if the gameId changes

  // This stops a click inside the modal from closing it
  const handleContentClick = (e) => e.stopPropagation();

  // Renders the modal's content *after* loading
  const renderModalContent = () => {
    if (loading) {
      return <p className="loading-message">Loading details...</p>;
    }

    if (error) {
      return <p className="error-message">{error}</p>;
    }

    // If we have no details, don't try to render
    if (!gameDetails) {
      return <p className="error-message">Could not load game data.</p>;
    }

    // Safely get lists of genres and platforms
    const genresList = gameDetails.genres?.map(g => g.name).join(', ') || 'N/A';
    const platformsList = gameDetails.platforms?.map(p => p.platform.name).join(', ') || 'N/A';

    const storeNameMap = new Map();

    return (
      <>
        <h2>{gameDetails.name}</h2>
        <img src={gameDetails.background_image} alt={gameDetails.name} className="modal-image" />
        
        {/* We use dangerouslySetInnerHTML to render the HTML description from the API */}
        <div 
          className="modal-description" 
          dangerouslySetInnerHTML={{ __html: gameDetails.description || '' }} 
        />

        <div className="modal-details">
          <p><strong>Rating:</strong> {gameDetails.rating || 'N/A'} / 5 (Metacritic: {gameDetails.metacritic || 'N/A'})</p>
          <p><strong>Released:</strong> {gameDetails.released || 'N/A'}</p>
          <p><strong>Genres:</strong> {genresList}</p>
          <p><strong>Platforms:</strong> {platformsList}</p>
        </div>

        {/* Store buttons*/}
        <div className="modal-stores-container">
          <h3>Available Stores:</h3>
          <div className="modal-stores-list">
            
            {/* Map over the 'stores' array (from the 2nd API call) */}
            {stores.length > 0 ? (
              stores.map(link => (
                <a 
                  key={link.id} 
                  href={ensureAbsoluteUrl(link.url)} // Get URL
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="modal-play-button"
                >
                  {/* Get Name from our map */}
                  {storeNameMap.get(link.store_id) || 'Go to Store'}
                </a>
              ))
            ) : (
              <p>No store links available for this game.</p>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    // The dark background overlay. Clicking it calls the 'onClose' function.
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        {renderModalContent()}
      </div>
    </div>
  );
}

export default GameModal;