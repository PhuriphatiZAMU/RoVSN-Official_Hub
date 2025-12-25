// src/components/NewsSection.jsx
import React from 'react';
import { newsArticles } from '../data/mockData';
import { ArrowRight } from 'lucide-react';

const NewsCard = ({ article }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
    <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
    <div className="p-6">
      <p className="text-sm text-gray-500 mb-2">{article.date}</p>
      <h3 className="font-oswald text-xl font-semibold mb-4 h-20">{article.title}</h3>
      <a href={article.link} className="flex items-center text-primary-custom font-semibold hover:underline">
        Read More <ArrowRight className="ml-2" size={16} />
      </a>
    </div>
  </div>
);

const NewsSection = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-oswald font-bold text-center text-navy-background mb-8">
          LATEST NEWS
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {newsArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
