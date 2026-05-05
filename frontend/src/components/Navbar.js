import { Link, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <Link to="/" className="brand">
          ⚡ EasyApply
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/applications" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Applications
              </NavLink>
              <NavLink to="/saved-jobs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Saved Jobs
              </NavLink>
              <NavLink to="/ai-tools" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                AI Tools
              </NavLink>
              <NavLink to="/resumes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Resumes
              </NavLink>
              <NavLink to="/notes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Notes
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Profile
              </NavLink>
              <button type="button" className="nav-cta ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-cta ghost">
                Sign In
              </NavLink>
              <NavLink to="/register" className="nav-cta">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;