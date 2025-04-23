import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>MastaSkillz</h1>
          </Link>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li className={location.pathname === '/explore' ? 'active' : ''}>
              <Link to="/explore">Explore Courses</Link>
            </li>
            <li className={location.pathname === '/my-courses' ? 'active' : ''}>
              <Link to="/my-courses">My Courses</Link>
            </li>
          </ul>
        </nav>
        
        <div className="header-actions">
          <Link to="/create-course" className="create-course-button">
            + Create Course
          </Link>
          <div className="user-menu">
            <div className="avatar">
              <img src="/assets/images/avatar-placeholder.png" alt="User Avatar" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;