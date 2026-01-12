import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { ConfirmModalProvider } from './components/common/ConfirmModal';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import FixturesPage from './pages/FixturesPage';
import StandingsPage from './pages/StandingsPage';
import StatsPage from './pages/StatsPage';
import ClubsPage from './pages/ClubsPage';
import FormatPage from './pages/FormatPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDraw from './pages/admin/AdminDraw';
import AdminResults from './pages/admin/AdminResults';
import AdminLogos from './pages/admin/AdminLogos';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ConfirmModalProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
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

              {/* Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="draw" element={<AdminDraw />} />
                <Route path="results" element={<AdminResults />} />
                <Route path="logos" element={<AdminLogos />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ConfirmModalProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
