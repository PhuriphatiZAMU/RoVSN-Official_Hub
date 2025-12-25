// src/pages/Players.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { fetchPlayers } from '../services/api';
import { ChevronDown, Loader2 } from 'lucide-react';

const Players = () => {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [teamFilter, setTeamFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('kda');

  useEffect(() => {
    const loadPlayers = async () => {
        try {
            setLoading(true);
            const data = await fetchPlayers();
            // The API might return fields with different names, so we map them here.
            const mappedData = data.map(p => ({
                id: p.player_id,
                name: p.player_name,
                team: p.team_name,
                role: p.role,
                games: p.matches_played,
                kills: p.total_kills,
                deaths: p.total_deaths,
                assists: p.total_assists,
                kda: parseFloat(p.kda),
                mvp: p.total_mvp,
                goldPerMin: parseFloat(p.gpm),
                damageDealt: parseFloat(p.avg_damage_dealt),
                damageTaken: parseFloat(p.avg_damage_taken),
            }));
            setPlayersData(mappedData);
            setError(null);
        } catch (err) {
            setError('Failed to load player stats. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    loadPlayers();
  }, []);

  const teams = ['All', ...new Set(playersData.map(p => p.team))];
  const roles = ['All', ...new Set(playersData.map(p => p.role))];
  const sortOptions = [
    { value: 'kda', label: 'KDA' },
    { value: 'kills', label: 'Kills' },
    { value: 'assists', label: 'Assists' },
    { value: 'goldPerMin', label: 'Gold/Min' },
    { value: 'mvp', label: 'MVP' },
  ];

  const filteredAndSortedPlayers = useMemo(() => {
    return playersData
      .filter(player => (teamFilter === 'All' || player.team === teamFilter))
      .filter(player => (roleFilter === 'All' || player.role === roleFilter))
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [playersData, teamFilter, roleFilter, sortBy]);

  const Select = ({ value, onChange, options, title }) => (
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full md:w-48 bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary-custom focus:border-primary-custom"
      >
        <option value="All">{title}</option>
        {options.map(option => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
    </div>
  );
  
  return (
    <div className="bg-lightblue-background min-h-screen">
      <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-oswald font-bold text-navy-background">PLAYER STATISTICS</h1>
        </header>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary-custom" size={64} />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        )}

        {!loading && !error && (
        <>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 p-4 bg-white rounded-lg shadow">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <Select value={teamFilter} onChange={setTeamFilter} options={teams} title="All Teams" />
                    <Select value={roleFilter} onChange={setRoleFilter} options={roles} title="All Roles" />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium text-gray-600">Sort by:</span>
                    <Select value={sortBy} onChange={setSortBy} options={sortOptions} title="Sort By"/>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-navy-background uppercase bg-gray-50 font-oswald tracking-wider">
                <tr>
                    <th className="px-4 py-4 text-center">#</th>
                    <th className="px-4 py-4">Player</th>
                    <th className="px-4 py-4">Team</th>
                    <th className="px-4 py-4 text-center hidden md:table-cell">Role</th>
                    <th className="px-4 py-4 text-center hidden lg:table-cell">Games</th>
                    <th className="px-4 py-4 text-center">K</th>
                    <th className="px-4 py-4 text-center">D</th>
                    <th className="px-4 py-4 text-center">A</th>
                    <th className="px-4 py-4 text-center">KDA</th>
                    <th className="px-4 py-4 text-center hidden lg:table-cell">MVP</th>
                    <th className="px-4 py-4 text-center hidden md:table-cell">GPM</th>
                    <th className="px-4 py-4 text-center hidden lg:table-cell">DMG</th>
                    <th className="px-4 py-4 text-center hidden lg:table-cell">Taken</th>
                </tr>
                </thead>
                <tbody className="divide-y">
                {filteredAndSortedPlayers.map((p, index) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center font-oswald text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/40?u=${p.id}`} alt={p.name} className="w-8 h-8 rounded-full object-cover"/>
                        <span className="font-semibold whitespace-nowrap">{p.name}</span>
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                            <img src={`/img/teams/${p.team.replace(/\s+/g, '-')}.png`} alt={p.team} className="w-6 h-6 object-contain" onError={(e) => { e.target.style.display = 'none'; }}/>
                            <span className="font-medium hidden md:block whitespace-nowrap">{p.team}</span>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 hidden md:table-cell">{p.role}</td>
                    <td className="px-4 py-3 text-center text-gray-600 hidden lg:table-cell">{p.games}</td>
                    <td className="px-4 py-3 text-center text-green-600">{p.kills}</td>
                    <td className="px-4 py-3 text-center text-red-600">{p.deaths}</td>
                    <td className="px-4 py-3 text-center text-blue-600">{p.assists}</td>
                    <td className="px-4 py-3 text-center font-bold text-primary-custom">{p.kda.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center text-yellow-500 hidden lg:table-cell">{p.mvp}</td>
                    <td className="px-4 py-3 text-center font-semibold hidden md:table-cell">{p.goldPerMin}</td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">{p.damageDealt.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">{p.damageTaken.toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Players;