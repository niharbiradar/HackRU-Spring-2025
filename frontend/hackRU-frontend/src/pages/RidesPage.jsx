import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Ride from '../components/Ride';




function RidesPage() {
    return (
        <div className="app-container">
          <Navbar />
            <main className="main-content">
                <Ride />
            </main>
        </div>
    );
}

export default RidesPage;
