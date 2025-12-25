// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { fetchFixtures, updateMatchScore, resetMatch } from '../services/api';
import { Loader2, Lock, Save, RefreshCw } from 'lucide-react';

import { ADMIN_PIN } from '../constants';

const AdminDashboard = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', error: false });

  // Group matches by day
  const matchesByDay = matches.reduce((acc, match) => {
    const day = `Day ${match.matchDay}`;
    if (!acc[day]) acc[day] = [];
    acc[day].push(match);
    return acc;
  }, {});

  useEffect(() => {
    if (isAuthenticated) {
      loadFixtures();
    }
  }, [isAuthenticated]);

  const loadFixtures = async () => {
    setLoading(true);
    try {
      const data = await fetchFixtures();
      setMatches(data);
    } catch (err) {
      setFeedback({ message: 'Failed to load matches.', error: true });
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid PIN');
      setIsAuthenticated(false);
    }
  };
  
  const handleScoreChange = (matchDay, matchNo, team, value) => {
    const newMatches = matches.map(m => {
        if (m.matchDay === matchDay && m.matchNo === matchNo) {
            return { ...m, [team]: value };
        }
        return m;
    });
    setMatches(newMatches);
  };

  const handleSaveScore = async (match) => {
    setFeedback({ message: 'Saving...', error: false });
    try {
        await updateMatchScore(match.matchDay, match.matchNo, match.score1, match.score2);
        setFeedback({ message: `Match ${match.matchNo} on Day ${match.matchDay} updated!`, error: false });
        setTimeout(() => loadFixtures(), 1500); // Refresh after update
    } catch (err) {
        setFeedback({ message: 'Failed to save score.', error: true });
    }
  };
  
  const handleResetMatch = async (match) => {
    if (!window.confirm(`Are you sure you want to reset Match ${match.matchNo} on Day ${match.matchDay}?`)) return;
    setFeedback({ message: 'Resetting...', error: false });
    try {
        await resetMatch(match.matchDay, match.matchNo);
        setFeedback({ message: `Match ${match.matchNo} on Day ${match.matchDay} has been reset.`, error: false });
        setTimeout(() => loadFixtures(), 1500);
    } catch (err) {
        setFeedback({ message: 'Failed to reset match.', error: true });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <form onSubmit={handlePinSubmit} className="p-8 bg-gray-800 rounded-lg shadow-lg text-center">
          <Lock size={48} className="mx-auto mb-4 text-primary-custom" />
          <h1 className="text-2xl font-oswald mb-4">Admin Access</h1>
          <p className="text-sm text-gray-400 mb-6">Enter PIN to manage tournament scores.</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full px-4 py-2 text-center text-lg bg-gray-700 border border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-primary-custom"
            maxLength="4"
          />
          <button type="submit" className="w-full bg-primary-custom text-navy-background font-bold py-2 rounded-md hover:bg-opacity-80 transition">
            Unlock
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-8 font-kanit">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-oswald text-white">Admin Dashboard</h1>
            <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-400 hover:text-white">Logout</button>
        </header>

        {feedback.message && (
            <div className={`p-4 mb-4 rounded-md text-center ${feedback.error ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {feedback.message}
            </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary-custom" size={64} />
          </div>
        ) : (
          <div className="space-y-12">
            {Object.keys(matchesByDay).map(day => (
              <div key={day}>
                <h2 className="text-2xl font-oswald border-b-2 border-primary-custom pb-2 mb-4">{day}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase text-gray-400">
                            <tr>
                                <th className="p-2">#</th>
                                <th className="p-2">Blue Team</th>
                                <th className="p-2 w-20">Score</th>
                                <th className="p-2 w-4">-</th>
                                <th className="p-2 w-20">Score</th>
                                <th className="p-2">Red Team</th>
                                <th className="p-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {matchesByDay[day].map(match => (
                            <tr key={match._id} className="hover:bg-gray-800">
                                <td className="p-3">{match.matchNo}</td>
                                <td className="p-3 font-semibold">{match.team1}</td>
                                <td className="p-3">
                                    <input type="number" value={match.score1 ?? ''} onChange={(e) => handleScoreChange(match.matchDay, match.matchNo, 'score1', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-center"/>
                                </td>
                                <td className="p-3 text-center">-</td>
                                <td className="p-3">
                                    <input type="number" value={match.score2 ?? ''} onChange={(e) => handleScoreChange(match.matchDay, match.matchNo, 'score2', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-center"/>
                                </td>
                                <td className="p-3 font-semibold">{match.team2}</td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleSaveScore(match)} title="Save Score" className="p-2 bg-green-600 hover:bg-green-500 rounded"><Save size={16}/></button>
                                        <button onClick={() => handleResetMatch(match)} title="Reset Match" className="p-2 bg-yellow-600 hover:bg-yellow-500 rounded"><RefreshCw size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
