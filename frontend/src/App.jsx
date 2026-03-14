import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import QuizSelection from './pages/QuizSelection';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';
import LearningPathPage from './pages/LearningPathPage';
import GamesPage from './pages/GamesPage';
import SimulationsPage from './pages/SimulationsPage';
import ChallengePage from './pages/ChallengePage';
import LeaderboardPage from './pages/LeaderboardPage';
import XPRewardsPage from './pages/XPRewardsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import CoursesPage from './pages/CoursesPage';
import LearningStyleQuiz from './pages/LearningStyleQuiz';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"></div><p>Loading...</p></div>;
  return user ? children : <Navigate to="/login" state={{ error: 'Unauthorized access. Please login again.' }} />;
}

function PublicRoute({ children }) {
  const { loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"></div><p>Loading...</p></div>;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* App entry point */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/welcome" element={<LandingPage />} />

            {/* Protected routes with sidebar layout */}
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quizzes" element={<QuizSelection />} />
              <Route path="/test/:subject" element={<TestPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/learning/:subject" element={<LearningPathPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/simulations" element={<SimulationsPage />} />
              <Route path="/challenge/:subject" element={<ChallengePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/xp-rewards" element={<XPRewardsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/learning-style" element={<LearningStyleQuiz />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
