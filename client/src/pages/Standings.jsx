// src/pages/Standings.jsx
import React, { useState, useEffect } from 'react';
import { fetchStandings } from '../services/api';
import { Loader2 } from 'lucide-react';

const FormGuide = ({ form }) => {
    // The API might return a string like "W,L,W,L,W", so we split it into an array
    const formArray = Array.isArray(form) ? form : (form || '').split(',');

    return (
        <div className="flex space-x-1.5">
        {formArray.map((result, index) => (
            <div
            key={index}
            className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs
                ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}
            title={result}
            >
            </div>
        ))}
        </div>
    );
};

const Standings = () => {
    const [standingsData, setStandingsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStandings = async () => {
        try {
            setLoading(true);
            const data = await fetchStandings();
            setStandingsData(data);
            setError(null);
        } catch (err) {
            setError('Failed to load standings. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        loadStandings();
    }, []);


  return (
    <div className="bg-lightblue-background min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-oswald font-bold text-navy-background">LEAGUE STANDINGS</h1>
        </header>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary-custom" size={64} />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        )}

        {!loading && !error && standingsData.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-navy-background uppercase bg-gray-50 font-oswald tracking-wider">
                <tr>
                    <th scope="col" className="px-6 py-4">Rank</th>
                    <th scope="col" className="px-6 py-4">Team</th>
                    <th scope="col" className="px-6 py-4 text-center">Played</th>
                    <th scope="col" className="px-6 py-4 text-center">W</th>
                    <th scope="col" className="px-6 py-4 text-center">L</th>
                    <th scope="col" className="px-6 py-4 text-center">+/-</th>
                    <th scope="col" className="px-6 py-4 text-center">Points</th>
                    <th scope="col" className="px-6 py-4">Form</th>
                </tr>
                </thead>
                <tbody>
                {standingsData.map((item) => (
                    <tr 
                    key={item.rank} 
                    className={`border-b ${item.rank <= 4 ? 'border-l-4 border-primary-custom' : ''} hover:bg-gray-50`}
                    >
                    <td className="px-6 py-4 font-oswald text-lg font-medium text-gray-900">{item.rank}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <img 
                            src={`/img/teams/${item.team_name.replace(/\s+/g, '-')}.png`}
                            alt={item.team_name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="font-semibold">{item.team_name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">{item.matches_played}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-semibold">{item.wins}</td>
                    <td className="px-6 py-4 text-center text-red-600 font-semibold">{item.losses}</td>
                    <td className="px-6 py-4 text-center font-semibold">{item.rounds_diff}</td>
                    <td className="px-6 py-4 text-center font-bold text-lg text-primary-custom">{item.points}</td>
                    <td className="px-6 py-4">
                        <FormGuide form={item.form} />
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        {!loading && !error && standingsData.length === 0 && (
             <div className="text-center text-gray-500 p-4">No standings available.</div>
        )}
        {!loading && !error && standingsData.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center">
                <div className="w-4 h-4 border-l-4 border-primary-custom mr-2"></div>
                <span>Top 4 teams qualify for playoffs.</span>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Standings;