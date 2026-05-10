import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatorPage from './pages/CreatorPage';
import PostDetailsPage from './pages/PostDetailsPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/posts/:id" element={<PostDetailsPage />} />
        <Route
          path="/creator"
          element={
            <ProtectedRoute roles={['creator']}>
              <CreatorPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
