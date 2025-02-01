import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

import Landing from './pages/Landing';
import RidesPage from './pages/RidesPage';


function App() {
    return (
        <div className="app-container">
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Landing/*" element={<Landing />} />
                    <Route path="/Rides" element={<RidesPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
