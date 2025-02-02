import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import '../css/onboarding.css';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [isDriver, setIsDriver] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        profilePicture: null,
        role: 'rider', 
        vehicleType: '',
        vehicleModel: '',
        plateNumber: '',
        vehicleState: ''
    });

    useEffect(() => {
        const storedEmail = Cookies.get("user_email");
        if (!storedEmail) {
            console.log("No email found. Redirecting to login...");
            navigate("/");
        }
    }, [navigate]);

    const handleRoleChange = (e) => {
        const role = e.target.value;
        setIsDriver(role === 'driver');
        setFormData(prevData => ({
            ...prevData,
            role
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(URL.createObjectURL(file));
            setFormData(prevData => ({
                ...prevData,
                profilePicture: file
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting onboarding form...");

        try {
            const storedEmail = Cookies.get("user_email");
            if (!storedEmail) {
                alert("Error: No email found. Please log in again.");
                navigate("/");
                return;
            }

            const response = await fetch("http://localhost:8000/users/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, email: storedEmail }), 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Onboarding successful:", data);
            navigate('/landing');

        } catch (err) {
            console.error("Error submitting onboarding form:", err);
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div className="container">
            <h2>Onboarding Form</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-item">
                    <label htmlFor="name">Full Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <div className="form-item upload-container">
                    <label htmlFor="profilePicture">Upload Profile Picture</label>
                    <input 
                        type="file" 
                        id="profilePicture" 
                        name="profilePicture" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {profilePicture && (
                        <div style={{ marginTop: '10px' }}>
                            <img 
                                src={profilePicture} 
                                alt="Profile Preview" 
                                style={{ width: '100px', height: '100px', borderRadius: '50%' }} 
                            />
                        </div>
                    )}
                </div>

                <div className="form-item">
                    <label>Are you a Rider or Driver?</label>
                    <div className="radio-group">
                        <label>
                            <input type="radio" value="rider" checked={!isDriver} onChange={handleRoleChange}/>
                            Rider
                        </label>
                        <label>
                            <input type="radio" value="driver" checked={isDriver} onChange={handleRoleChange}/>
                            Driver
                        </label>
                    </div>
                </div>

                {isDriver && (
                    <div>
                        <div className="form-item">
                            <label>Vehicle Model</label>
                            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} required />
                        </div>
                        <div className="form-item">
                            <label>Plate Number</label>
                            <input type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} required />
                        </div>
                        <div className="form-item">
                            <label>State of Registration</label>
                            <input type="text" name="vehicleState" value={formData.vehicleState} onChange={handleChange} required />
                        </div>
                    </div>
                )}

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default OnboardingPage;
