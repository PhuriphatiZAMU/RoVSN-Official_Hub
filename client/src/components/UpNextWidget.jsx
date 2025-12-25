// src/components/UpNextWidget.jsx
import React from 'react';
import { upcomingMatches } from '../data/mockData';
import { Clock } from 'lucide-react';

const UpNextWidget = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 my-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-oswald font-bold text-center text-navy-background mb-6">
        UP NEXT
      </h2>
      <div className="space-y-4">
        {upcomingMatches.map((match, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <span className="font-bold text-lg text-gray-800 w-36 text-right">{match.team1}</span>
              <img src={`/img/teams/${match.team1.replace(/\s+/g, '-')}.png`} alt={match.team1} className="w-12 h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}/>
              <span className="hidden w-12 h-12 bg-gray-300 rounded-full"></span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-oswald font-bold text-primary-custom">{match.time}</div>
              <div className="text-sm text-gray-500">{match.day}</div>
            </div>
            <div className="flex items-center space-x-4">
              <img src={`/img/teams/${match.team2.replace(/\s+/g, '-')}.png`} alt={match.team2} className="w-12 h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.previousSibling.style.display = 'block'; }}/>
              <span className="hidden w-12 h-12 bg-gray-300 rounded-full"></span>
              <span className="font-bold text-lg text-gray-800 w-36 text-left">{match.team2}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-6">
        <a href="/schedule" className="text-primary-custom font-semibold hover:underline">
          View Full Schedule
        </a>
      </div>
    </div>
  );
};

export default UpNextWidget;

// Note: Team logos are expected to be in /public/img/teams/Team-Name.png
// I have added a basic error handler to hide broken images.
