import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from '../../src/features/applications/Dashboard';
import ApplicationsList from '../../src/features/applications/ApplicationsList';
import ApplicationDetail from '../../src/features/applications/ApplicationDetail';
import Settings from '../../src/features/settings/Settings';

export default function App() {
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="top-nav-inner">
          <span className="brand">EasyApply</span>
          <div className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/applications"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Applications
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Settings
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationsList />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
