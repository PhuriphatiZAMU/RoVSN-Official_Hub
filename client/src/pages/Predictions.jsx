// src/pages/Predictions.jsx
import React, { useState, useEffect } from 'react';
import { fetchPredictions } from '../services/api';
import { Loader2, BrainCircuit } from 'lucide-react';

const ProbabilityBar = ({ blueProb, redProb }) => (
    <div className="w-full flex rounded-full h-8 bg-red-500/30 overflow-hidden my-2">
        <div 
            className="flex items-center justify-center bg-blue-500 h-full text-xs font-bold text-white" 
            style={{ width: `${blueProb}%` }}
        >
            {blueProb}%
        </div>
        <div 
            className="flex items-center justify-center bg-red-500 h-full text-xs font-bold text-white" 
            style={{ width: `${redProb}%` }}
        >
            {redProb}%
        </div>
    </div>
);

const PredictionCard = ({ prediction }) => {
    const { blue, red } = prediction.match;
    const { probabilities, confidence, insight } = prediction.analysis;
    const blueProb = probabilities[blue];
    const redProb = probabilities[red];

    let confidenceText = 'Low Confidence';
    if (confidence > 70) confidenceText = 'High Confidence';
    else if (confidence > 55) confidenceText = 'Medium Confidence';

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <img src={`/img/teams/${blue.replace(/\s+/g, '-')}.png`} alt={blue} className="w-10 h-10 object-contain"/>
                    <span className="font-oswald text-xl font-bold text-gray-800">{blue}</span>
                </div>
                <div className="font-oswald text-2xl text-gray-400">VS</div>
                <div className="flex items-center gap-3">
                    <span className="font-oswald text-xl font-bold text-gray-800">{red}</span>
                    <img src={`/img/teams/${red.replace(/\s+/g, '-')}.png`} alt={red} className="w-10 h-10 object-contain"/>
                </div>
            </div>
            
            <ProbabilityBar blueProb={blueProb} redProb={redProb} />

            <div className="text-center my-4">
                <p className="text-sm text-gray-500">AI PREDICTION</p>
                <p className="font-bold text-lg text-primary-custom">{prediction.prediction.winner} wins</p>
                <p className="text-xs text-gray-400">({confidenceText}: {confidence}%)</p>
            </div>

            <div className="bg-gray-100 p-4 rounded-md">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><BrainCircuit size={16} /> AI Insight:</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{insight}</p>
            </div>
        </div>
    );
};


const Predictions = () => {
  const [selectedDay, setSelectedDay] = useState(2); // Default to Day 2 as per API
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Assuming a max of 8 days for tabs
  const availableDays = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchPredictions(selectedDay);
        setData(result);
      } catch (err) {
        setError(`Failed to load predictions for Day ${selectedDay}.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [selectedDay]);

  return (
    <div className="bg-lightblue-background min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-oswald font-bold text-navy-background">AI MATCH PREDICTIONS</h1>
          <p className="text-gray-600 mt-2">Powered by statistical analysis and machine learning.</p>
        </header>

        <div className="flex justify-center border-b-2 border-gray-300 mb-8">
          {availableDays.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`py-4 px-6 font-oswald text-lg uppercase tracking-wider -mb-0.5
                ${selectedDay === day
                  ? 'border-b-4 border-primary-custom text-primary-custom'
                  : 'text-gray-500 hover:text-navy-background'
                }`}
            >
              Day {day}
            </button>
          ))}
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary-custom" size={64} />
            <p className="ml-4 text-gray-600">Calculating Predictions...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        )}

        {!loading && !error && data && (
            <div className="space-y-8">
                {data.predictions.map((p, index) => (
                    <PredictionCard key={index} prediction={p} />
                ))}
                 <p className="text-center text-sm text-gray-500 mt-8">{data.disclaimer}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;
