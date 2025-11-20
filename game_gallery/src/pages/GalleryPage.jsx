import React, { useState, useEffect } from 'react';
import '../App.css'; 
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal';
import { useAuth } from '../authContext'; 

const GAMES_PER_PAGE = 20;

export function GalleryPage() {
  const [view, setView] = useState(() => {
    const savedView = localStorage.getItem('gameGalleryView');
    // If we find a saved view, use it. Otherwise, default to 'gallery'.
    return savedView === 'favourites' ? 'favourites' : 'gallery';
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [games, setGames] = useState([]); 
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [genres, setGenres] = useState([]); 
  const [platforms, setPlatforms] = useState([]); 
  const [selectedSort, setSelectedSort] = useState('-added'); 
  const [selectedGenre, setSelectedGenre] = useState(''); 
  const [selectedPlatform, setSelectedPlatform] = useState(''); 

  const apiKey = '89b79a0a975f4f7585a142edaa0974ea';
  const { user, logout, deleteAccount, isGuest } = useAuth();

  useEffect(() => {
    localStorage.setItem('gameGalleryView', view);
  }, [view]); 

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const genreRes = await fetch(`/api/genres?key=${apiKey}`);
        if (!genreRes.ok) throw new Error('Failed to fetch genres');
        const genreData = await genreRes.json();
        setGenres(genreData.results);
        const platformRes = await fetch(`/api/platforms/lists/parents?key=${apiKey}`);
        if (!platformRes.ok) throw new Error('Failed to fetch platforms');
        const platformData = await platformRes.json();
        setPlatforms(platformData.results);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFilters();
  }, [apiKey]); 

  useEffect(() => {
    if (view !== 'gallery') return; 

    async function fetchGames() {
      setLoading(true);
      setError(null);
      let apiUrl = `/api/games?key=${apiKey}&page_size=${GAMES_PER_PAGE}&page=${currentPage}`;
      apiUrl += `&esrb_rating=1,2,3,4`; 
      apiUrl += `&exclude_tags=210,211`;
      
      if (activeSearch) apiUrl += `&search=${activeSearch}`;
      if (selectedGenre) apiUrl += `&genres=${selectedGenre}`;
      if (selectedPlatform) apiUrl += `&platforms=${selectedPlatform}`;
      if (selectedSort !== 'relevance') {
        apiUrl += `&ordering=${selectedSort}`;
      }
      try {
        const response = await fetch(apiUrl); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
  }, [view, currentPage, activeSearch, selectedSort, selectedGenre, selectedPlatform, apiKey]); 

  const handleGameClick = (game) => setSelectedGameId(game.id);
  const handleCloseModal = () => setSelectedGameId(null);
  const goToNextPage = () => setCurrentPage(page => page + 1);
  const goToPrevPage = () => setCurrentPage(page => page - 1);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  
  const handleSearchSubmit = (event) => {
    event.preventDefault(); 
    setActiveSearch(searchTerm); 
    setCurrentPage(1); 
    setSelectedSort('relevance');
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
  
  const goToHome = () => {
    setView('gallery'); 
    setSearchTerm('');
    setActiveSearch('');
    setCurrentPage(1);
    setSelectedSort('-added');
    setSelectedGenre('');
    setSelectedPlatform('');
  };

  const handleDeleteAccount = async () => {
    if (isGuest) {
      alert("Guest accounts cannot be deleted. Just log out.");
      return;
    }
    
    const confirmUsername = prompt(
      'This is permanent and cannot be undone!\n\nTo confirm, type your username:'
    );

    if (confirmUsername === user.username) {
      await deleteAccount();
    } else if (confirmUsername !== null) { 
      alert('Usernames did not match. Account not deleted.');
    }
  };

  const renderContent = () => {
    if (loading) return <p className="loading-message">Loading games...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (games.length === 0 && !loading) return <p className="loading-message">No games found.</p>;
    
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
      <div className="header-container">
        <h1 className="main-title" onClick={goToHome}>
          Game Gallery
        </h1>
        <div className="auth-info">
          <span>Welcome, {user.username || user.name}</span>
          <button onClick={logout} className="logout-button">Logout</button>
          {!isGuest && (
            <button onClick={handleDeleteAccount} className="logout-button delete-button">
              Delete Account
            </button>
          )}
        </div>
      </div>
      
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
      <div className="filter-container">
        <select className="filter-select" value={selectedSort} onChange={handleSortChange}>
          <option value="-added">Sort by: Popularity</option>
          <option value="relevance">Sort by: Relevance</option>
          <option value="-metacritic">Sort by: Metacritic</option>
          <option value="-rating">Sort by: Rating</option>
          <option value="-released">Sort by: Newest</option>
          <option value="name">Sort by: Name (A-Z)</option>
          <option value="-name">Sort by: Name (Z-A)</option>
        </select>
        <select className="filter-select" value={selectedGenre} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
        <select className="filter-select" value={selectedPlatform} onChange={handlePlatformChange}>
          <option value="">All Platforms</option>
          {platforms.map(platform => (
            <option key={platform.id} value={platform.id}>{platform.name}</option>
          ))}
        </select>
      </div>
      <main>{renderContent()}</main>
      {!loading && !error && games.length > 0 && (
        <div className="pagination-container">
          <button onClick={goToPrevPage} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
        </div>
      )}
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