import React from 'react';
import { Link } from 'react-router-dom';
import '../css/navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">

            <div className="navbar-logo">
                <Link to="/Home">Student Ride Share</Link> {/* Link to the home route */}
            </div>

            <ul className="navbar-links">
                <li><Link to="/Home">Home</Link></li>
                <li><Link to="/about">Rides</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
