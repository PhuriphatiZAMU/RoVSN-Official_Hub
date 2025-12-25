// src/components/MatchCard.jsx
import React from 'react';

const TeamDisplay = ({ teamName, winner, logoFirst = false }) => {
  const teamNameSanitized = teamName.replace(/\s+/g, '-');
  const logoUrl = `/img/teams/${teamNameSanitized}.png`;
  
  const winnerClass = winner === teamName ? 'text-green-500 font-bold' : '';

  const content = (
    <>
      <img 
        src={logoUrl} 
        alt={teamName} 
        className="w-10 h-10 object-contain"
        onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=?'; }} // Fallback
      />
      <span className={`text-lg font-oswald ${winnerClass}`}>{teamName}</span>
    </>
  );

  return logoFirst 
    ? <div className="flex items-center gap-4">{content}</div>
    : <div className="flex items-center justify-end gap-4">{content}</div>;
};

const MatchCard = ({ match }) => {
  const { time, team1, score1, team2, score2, status, winner } = match;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-primary-custom/50 hover:border-primary-custom border-transparent border-2 transition-all duration-300 p-4 mb-4 flex items-center justify-between">
      <div className="text-center w-24">
        <div className="text-gray-600 font-semibold">{time}</div>
        <div className={`text-xs uppercase font-bold ${status === 'completed' ? 'text-red-500' : 'text-gray-400'}`}>
          {status}
        </div>
      </div>

      <div className="flex-1 text-right pr-4">
        <TeamDisplay teamName={team1} winner={winner} />
      </div>

      <div className="w-20 text-center font-oswald text-3xl font-bold">
        {status === 'completed' ? (
          <div className="flex justify-center items-center">
            <span className={score1 > score2 ? 'text-green-500' : ''}>{score1}</span>
            <span className="mx-2">-</span>
            <span className={score2 > score1 ? 'text-green-500' : ''}>{score2}</span>
          </div>
        ) : (
          <span className="text-gray-400">VS</span>
        )}
      </div>

      <div className="flex-1 pl-4">
        <TeamDisplay teamName={team2} winner={winner} logoFirst />
      </div>

      <div className="w-24" /> 
    </div>
  );
};

export default MatchCard;
