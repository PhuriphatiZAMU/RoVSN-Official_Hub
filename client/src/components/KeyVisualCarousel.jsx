// src/components/KeyVisualCarousel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { keyVisuals } from '../data/Data';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const KeyVisualCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? keyVisuals.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex]); // Add currentIndex as dependency for prevSlide

  const nextSlide = useCallback(() => {
    const isLastSlide = currentIndex === keyVisuals.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex]); // Add currentIndex as dependency for nextSlide

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // Auto-slide every 5 seconds
    return () => clearInterval(slideInterval);
  }, [nextSlide]); // Now nextSlide is a stable dependency

  return (
    <div className="relative w-full h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {keyVisuals.map((visual, index) => (
          <img
            key={index}
            src={visual.src}
            alt={visual.alt}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 transition"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 transition"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {keyVisuals.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition ${
              currentIndex === index ? 'bg-primary-custom' : 'bg-gray-400'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default KeyVisualCarousel;