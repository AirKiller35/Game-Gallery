import React, { useState, useEffect } from 'react';
import '../App.css'; 
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal'; // Now using the real modal

const GAMES_PER_PAGE = 20;
const apiKey = '89b79a0a975f4f7585a142edaa0974ea';

export function GalleryPage() {
  // --- State for Game Data ---
  const [games, setGames] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- State for Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // --- State for Search & Filter ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(null);

  // Filter Dropdown States
  const [genres, setGenres] = useState([]); 
  const [platforms, setPlatforms] = useState([]); 
  const [selectedSort, setSelectedSort] = useState('-added'); // Default: Popularity
  const [selectedGenre, setSelectedGenre] = useState(''); 
  const [selectedPlatform, setSelectedPlatform] = useState(''); 

  // --- Effect 1: Fetch Filter Options (Genres/Platforms) ---
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch genres list
        const genreRes = await fetch(`/api/genres?key=${apiKey}`);
        if (!genreRes.ok) throw new Error('Failed to fetch genres');
        const genreData = await genreRes.json();
        setGenres(genreData.results);

        // Fetch platforms list (using 'parents' for a cleaner list)
        const platformRes = await fetch(`/api/platforms/lists/parents?key=${apiKey}`);
        if (!platformRes.ok) throw new Error('Failed to fetch platforms');
        const platformData = await platformRes.json();
        setPlatforms(platformData.results);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFilters();
  }, []); // Runs once on mount

  // --- Effect 2: Fetch Games (The Main Logic) ---
  // Re-runs whenever any filter/page state changes
  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setError(null);

      // Build the API URL dynamically
      let apiUrl = `/api/games?key=${apiKey}&page_size=${GAMES_PER_PAGE}&page=${currentPage}`;
      
      // 2. Add search term if active
      if (activeSearch) {
        apiUrl += `&search=${activeSearch}`;
      }
      
      // 3. Add dropdown filters if selected
      if (selectedGenre) apiUrl += `&genres=${selectedGenre}`;
      if (selectedPlatform) apiUrl += `&platforms=${selectedPlatform}`;

      // 4. Handle Sorting Logic
      if (selectedSort !== 'relevance') {
        apiUrl += `&ordering=${selectedSort}`;
      }

      try {
        const response = await fetch(apiUrl); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        setGames(data.results); 
        setTotalPages(Math.ceil(data.count / GAMES_PER_PAGE));

      } catch (error) {
        console.error("Could not fetch games:", error);
        setError("Failed to load games. Please try again.");
        setGames([]); 
        setTotalPages(0); 
      } finally {
        setLoading(false);
      }
    }
    
    fetchGames(); 
  }, [currentPage, activeSearch, selectedSort, selectedGenre, selectedPlatform]); 

  // --- Event Handlers ---

  const handleGameClick = (game) => setSelectedGameId(game.id);
  const handleCloseModal = () => setSelectedGameId(null);
  const goToNextPage = () => setCurrentPage(page => page + 1);
  const goToPrevPage = () => setCurrentPage(page => page - 1);

  // Updates the search bar text as you type
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Triggers the search when form is submitted
  const handleSearchSubmit = (event) => {
    event.preventDefault(); 
    setActiveSearch(searchTerm); 
    setCurrentPage(1); // Reset to page 1
    setSelectedSort('relevance'); // Auto-switch to relevance sort
  };
  
  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
    setCurrentPage(1); 
  };
  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setCurrentPage(1); 
  };
  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
    setCurrentPage(1); 
  };
  
  // Resets everything to default
  const goToHome = () => {
    setSearchTerm('');
    setActiveSearch('');
    setCurrentPage(1);
    setSelectedSort('-added'); // Default back to Popularity
    setSelectedGenre('');
    setSelectedPlatform('');
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (loading) {
      return <p className="loading-message">Loading games...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (games.length === 0 && !loading) {
      return <p className="loading-message">No games found.</p>;
    }

    return (
      <div id="game-gallery-container">
        {games.map(game => (
          <GameCard key={game.id} game={game} onGameClick={handleGameClick} />
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      {/* Header with Home Reset */}
      <h1 className="main-title" onClick={goToHome}>Game Gallery</h1>

      {/* Search Bar */}
      <form className="search-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by title..."
          className="search-bar"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {/* Filter & Sort Bar */}
      <div className="filter-container">
        {/* Sort Dropdown */}
        <select 
          className="filter-select" 
          value={selectedSort} 
          onChange={handleSortChange} 
        >
          <option value="-added">Sort by: Popularity</option>
          <option value="relevance">Sort by: Relevance</option>
          <option value="-metacritic">Sort by: Metacritic</option>
          <option value="-rating">Sort by: Rating</option>
          <option value="-released">Sort by: Newest</option>
          <option value="name">Sort by: Name (A-Z)</option>
          <option value="-name">Sort by: Name (Z-A)</option>
        </select>

        {/* Genre Dropdown */}
        <select className="filter-select" value={selectedGenre} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>

        {/* Platform Dropdown */}
        <select className="filter-select" value={selectedPlatform} onChange={handlePlatformChange}>
          <option value="">All Platforms</option>
          {platforms.map(platform => (
            <option key={platform.id} value={platform.id}>{platform.name}</option>
          ))}
        </select>
      </div>

      <main>
        {renderContent()}
      </main>

      {/* Pagination */}
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
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
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