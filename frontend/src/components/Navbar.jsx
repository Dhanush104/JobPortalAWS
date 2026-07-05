import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <span>Career</span>Pulse
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-item">Find Jobs</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="nav-item">Dashboard</Link>
              {user.role === 'employer' && (
                <Link to="/post-job" className="nav-item btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  Post a Job
                </Link>
              )}
              <span className="user-greeting">
                Hello, <strong style={{ color: 'var(--primary)' }}>{user.name}</strong> ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/register" className="nav-item btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
