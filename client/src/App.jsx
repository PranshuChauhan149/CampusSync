import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import LostAndFound from './pages/LostAndFound';
import Books from './pages/Books';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import SearchResults from './pages/SearchResults';
import './index.css';
import Navbar from './components/Navbar';
import AllItemDetals from './pages/AllItemDetals';
import StudyMaterial from './pages/StudyMaterial';
import ClaimRequests from './pages/ClaimRequests';
import ClaimHistory from './pages/ClaimHistory';
import Admin from './pages/Admin';
import ItemDetail from './pages/ItemDetail';
import BookDetail from './pages/BookDetail';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/lost-found" element={<LostAndFound />} />
                <Route path="/item/:id" element={<ItemDetail />} />
                <Route path="/books" element={<Books />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/my-items" element={<AllItemDetals/>} />
                <Route path="/study-material" element={<StudyMaterial />} />
                <Route path="/claim-requests" element={<ClaimRequests />} />
                <Route path="/claim-history" element={<ClaimHistory />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/dashboard" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-white dark:text-gray-100 mb-4">Dashboard</h1>
                      <p className="text-slate-400 dark:text-gray-400 text-lg">Welcome to your CampusSync dashboard</p>
                    </div>
                  </div>
                } />
              </Routes>
            </div>
          </Router>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
