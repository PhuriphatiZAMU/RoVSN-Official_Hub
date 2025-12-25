// src/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Footer = () => (
  <footer className="bg-navy-background text-white py-8 font-kanit">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p>&copy; 2026 RoV SN Tournament Hub. All Rights Reserved.</p>
      <p className="text-sm text-gray-400 mt-2">
        This is a fictional tournament website for demonstration purposes.
      </p>
      <div className="mt-4">
        <a href="/admin" className="text-xs text-gray-600 hover:text-primary-custom transition">Admin Panel</a>
      </div>
    </div>
  </footer>
);

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
