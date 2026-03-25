import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
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
// New Pages
import AIChatPage from './pages/AIChatPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CodePlaygroundPage from './pages/CodePlaygroundPage';
import DiscussionPage from './pages/DiscussionPage';
import CertificatePage from './pages/CertificatePage';
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
      <ThemeProvider>
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
                {/* New Routes */}
                <Route path="/ai-tutor" element={<AIChatPage />} />
                <Route path="/study-planner" element={<StudyPlannerPage />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />
                <Route path="/code-playground" element={<CodePlaygroundPage />} />
                <Route path="/discussions" element={<DiscussionPage />} />
                <Route path="/certificates" element={<CertificatePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
