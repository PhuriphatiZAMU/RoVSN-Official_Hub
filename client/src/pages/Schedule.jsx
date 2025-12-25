// src/pages/Schedule.jsx
import React, { useState, useEffect } from 'react';
import { fetchSchedules } from '../services/api';
import MatchCard from '../components/MatchCard';
import { Loader2 } from 'lucide-react';

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState({});
  const [selectedDay, setSelectedDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const data = await fetchSchedules();
        setScheduleData(data);
        if (Object.keys(data).length > 0) {
          setSelectedDay(Object.keys(data)[0]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load schedule. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  const days = Object.keys(scheduleData);

  return (
    <div className="bg-lightblue-background min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-oswald font-bold text-navy-background">MATCH SCHEDULE</h1>
        </header>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary-custom" size={64} />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        )}

        {!loading && !error && days.length > 0 && (
          <>
            <div className="flex justify-center border-b-2 border-gray-300 mb-8">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-4 px-6 font-oswald text-lg uppercase tracking-wider -mb-0.5
                    ${selectedDay === day 
                      ? 'border-b-4 border-primary-custom text-primary-custom' 
                      : 'text-gray-500 hover:text-navy-background'
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="schedule-list">
              {scheduleData[selectedDay]?.map((match, index) => (
                <MatchCard key={index} match={match} />
              ))}
            </div>
          </>
        )}
         {!loading && !error && days.length === 0 && (
            <div className="text-center text-gray-500 p-4">No schedule available.</div>
        )}
      </div>
    </div>
  );
};

export default Schedule;