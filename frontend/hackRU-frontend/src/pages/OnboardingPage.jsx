import React, { useState } from 'react';
import '../css/onboarding.css';
import { useNavigate } from "react-router-dom";

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [isDriver, setIsDriver] = useState(false); // Tracks if the user is a driver
    const [profilePicture, setProfilePicture] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        profilePicture: null,
        role: 'rider', // Default is 'rider'
        vehicleType: '',
        vehicleModel: '',
        plateNumber: '',
        vehicleState: ''
    });

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

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        console.log(formData); // Log the form data to the console
        navigate('/landing');
    };

    const states = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
        "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
        "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
    ];

    return (
        <div className="container">
            <h2>Onboarding Form</h2>
            <form onSubmit={handleSubmit}>
                {/* Name */}
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

                {/* Profile Picture Upload */}
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

                {/* Role Selection */}
                <div className="form-item">
                    <label>Are you a Rider or Driver?</label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="rider"
                                checked={!isDriver}
                                onChange={handleRoleChange}
                            />
                            Rider
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="driver"
                                checked={isDriver}
                                onChange={handleRoleChange}
                            />
                            Driver
                        </label>
                    </div>
                </div>

                {/* Driver's Vehicle Information (only shows if the user is a driver) */}
                {isDriver && (
                    <div>
                        <div className="form-item">
                            <label htmlFor="vehicleType">Vehicle Type</label>
                            <select 
                                id="vehicleType" 
                                name="vehicleType" 
                                value={formData.vehicleType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Vehicle Type</option>
                                <option value="SUV">SUV</option>
                                <option value="Sedan">Sedan</option>
                            </select>
                        </div>

                        <div className="form-item">
                            <label htmlFor="vehicleModel">Vehicle Model</label>
                            <input 
                                type="text" 
                                id="vehicleModel" 
                                name="vehicleModel" 
                                value={formData.vehicleModel}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="form-item">
                            <label htmlFor="plateNumber">Plate Number</label>
                            <input 
                                type="text" 
                                id="plateNumber" 
                                name="plateNumber" 
                                value={formData.plateNumber}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="form-item">
                            <label htmlFor="vehicleState">Vehicle State</label>
                            <select 
                                id="vehicleState" 
                                name="vehicleState" 
                                value={formData.vehicleState}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select State</option>
                                {states.map((state, index) => (
                                    <option key={index} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default OnboardingPage;
