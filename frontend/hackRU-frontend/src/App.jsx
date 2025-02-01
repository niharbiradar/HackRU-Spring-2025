import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';

const Home = () => <h1>Home Page</h1>;



function App() {
    return (
        <div className="app-container">
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Landing" element={<Home />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
