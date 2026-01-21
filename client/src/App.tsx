import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ConfirmModalProvider } from './components/common/ConfirmModal.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

// Layouts
import Layout from './components/layout/Layout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

// Public Pages
import HomePage from './pages/HomePage.jsx';
import FixturesPage from './pages/FixturesPage.jsx';
import StandingsPage from './pages/StandingsPage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import ClubsPage from './pages/ClubsPage.jsx';
import FormatPage from './pages/FormatPage.jsx';

// Admin Pages
import LoginPage from './pages/admin/LoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDraw from './pages/admin/AdminDraw.jsx';
import AdminResults from './pages/admin/AdminResults.jsx';
import AdminLogos from './pages/admin/AdminLogos.jsx';
import AdminPlayersPage from './pages/admin/AdminPlayersPage.jsx';
import AdminHeroesPage from './pages/admin/AdminHeroesPage.jsx';
import AdminTeamsPage from './pages/admin/AdminTeamsPage';
import AdminSchedulePage from './pages/admin/AdminSchedulePage';
import AdminGameStatsPage from './pages/admin/AdminGameStatsPage';
import AdminResultHistory from './pages/admin/AdminResultHistory';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

function App(): React.ReactElement {
    return (
        <LanguageProvider>
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
                                    <Route path="players" element={<AdminPlayersPage />} />
                                    <Route path="heroes" element={<AdminHeroesPage />} />
                                    <Route path="logos" element={<AdminLogos />} />
                                    <Route path="teams" element={<AdminTeamsPage />} />
                                    <Route path="schedule" element={<AdminSchedulePage />} />
                                    <Route path="game-stats" element={<AdminGameStatsPage />} />
                                    <Route path="result-history" element={<AdminResultHistory />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </ConfirmModalProvider>
                </DataProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
