import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import FixturesPage from './pages/FixturesPage';
import StandingsPage from './pages/StandingsPage';
import StatsPage from './pages/StatsPage';
import ClubsPage from './pages/ClubsPage';
import FormatPage from './pages/FormatPage';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="fixtures" element={<FixturesPage />} />
            <Route path="standings" element={<StandingsPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="stats/team" element={<StatsPage />} />
            <Route path="stats/player" element={<StatsPage />} />
            <Route path="clubs" element={<ClubsPage />} />
            <Route path="format" element={<FormatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
