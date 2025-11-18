import React from 'react';

function GameCard({ game, onGameClick }) {
  return (
    <div className="game-card" onClick={() => onGameClick(game)}>
      {/* Use the 'background_image' from the API as the card's thumbnail */}
      <img src={game.background_image} alt={game.name} />
      
      <div className="game-card-content">
        <h3>{game.name}</h3>
        <p>Rating: {game.rating} / 5</p>
        <p>Released: {game.released}</p>
      </div>
    </div>
  );
}

export default GameCard;