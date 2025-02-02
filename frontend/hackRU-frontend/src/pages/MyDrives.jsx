import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DrivesDash from '../components/DrivesDash';


function MyDrives() {
    return (
        <div className="app-container">
          <Navbar />
            <main className="main-content">
                <DrivesDash />
            </main>
        </div>
    );
}

export default MyDrives;
