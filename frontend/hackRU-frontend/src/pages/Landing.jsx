import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../components/Home';


function Landing() {
    return (
        <div className="app-container">
          <Navbar />
            <main className="main-content">
                <Home />
            </main>
        </div>
    );
}

export default Landing;
