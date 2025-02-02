import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/rides">Campus Ride Share</Link>
        </div>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/rides" className="navbar-item">Rides</Link>
          <Link to="/myDrives" className="navbar-item">My Drives</Link>
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
