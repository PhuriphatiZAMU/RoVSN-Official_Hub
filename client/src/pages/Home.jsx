// src/pages/Home.jsx
import React from 'react';
import KeyVisualCarousel from '../components/KeyVisualCarousel';
import UpNextWidget from '../components/UpNextWidget';
import NewsSection from '../components/NewsSection';

const Home = () => {
  return (
    <div>
      <KeyVisualCarousel />
      <div className="container mx-auto px-4">
        <UpNextWidget />
        <NewsSection />
      </div>
    </div>
  );
};

export default Home;
