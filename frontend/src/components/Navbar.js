import { Link, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <Link to="/" className="brand">
          EasyApply
        </Link>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/applications" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Applications
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Profile
          </NavLink>
          {user ? (
            <button type="button" className="nav-cta ghost" onClick={logout}>
              Logout
            </button>
          ) : (
            <NavLink to="/login" className="nav-cta">
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;