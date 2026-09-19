import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Profile from './pages/Profile';
import SavedJobs from './pages/SavedJobs';
import AITools from './pages/AITools';
import ResumeManager from './pages/ResumeManager';
import NoteManagement from './pages/NoteManagement';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/resumes" element={<ResumeManager />} />
          <Route path="/notes" element={<NoteManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;