// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Standings from './pages/Standings';
import Players from './pages/Players';
import AdminDashboard from './pages/AdminDashboard';
import Predictions from './pages/Predictions';

// Placeholder pages to avoid routing errors
const Placeholder = ({ title }) => <div className="p-8"><h1 className="text-3xl font-oswald">{title}</h1><p>This page is under construction.</p></div>;

const Teams = () => <Placeholder title="Teams" />;


function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="table" element={<Standings />} />
        <Route path="players" element={<Players />} />
        <Route path="predictions" element={<Predictions />} /> {/* New route */}
        <Route path="teams" element={<Teams />} />
      </Route>
      
      {/* Admin Route */}
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;