import React from 'react';
import { Link } from 'react-router-dom';
import '../css/navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">

            <div className="navbar-logo">
                <Link to="/Landing">Student Ride Share</Link> {/* Link to the home route */}
            </div>

            <ul className="navbar-links">
                <li><Link to="/Landing">Home</Link></li>
                <li><Link to="/Rides">Rides</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
