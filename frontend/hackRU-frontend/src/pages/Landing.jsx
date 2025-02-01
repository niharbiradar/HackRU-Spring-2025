import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Navbar from './components/Navbar';

const Home = () => <h1>Home Page</h1>;



function Landing() {
    return (
        <div className="app-container">
          <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/Landing" element={<Home />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
