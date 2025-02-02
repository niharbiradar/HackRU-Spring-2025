import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import '../css/onboarding.css';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [isDriver, setIsDriver] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size should be less than 5MB");
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert("Please upload an image file (JPG, PNG, or GIF)");
                return;
            }

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
    
        const maxRetries = 3;
        let retryCount = 0;
    
        const trySubmit = async () => {
            try {
                const storedEmail = Cookies.get("user_email");
                if (!storedEmail) {
                    alert("Error: No email found. Please log in again.");
                    navigate("/");
                    return;
                }
    
                // Create FormData object
                const formDataToSend = new FormData();
                formDataToSend.append('email', storedEmail);
                formDataToSend.append('name', formData.name);
                formDataToSend.append('role', formData.role);
    
                if (formData.profilePicture) {
                    formDataToSend.append('profilePicture', formData.profilePicture);
                } else {
                    formDataToSend.append('profilePicture', null);
                }
    
                if (isDriver) {
                    formDataToSend.append('vehicleModel', formData.vehicleModel);
                    formDataToSend.append('plateNumber', formData.plateNumber);
                    formDataToSend.append('vehicleState', formData.vehicleState);
                }
    
                const response = await fetch("http://localhost:8000/users/onboard", {
                    method: "POST",
                    credentials: "include",
                    body: formDataToSend,
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                console.log("Onboarding successful:", data);
                navigate('/rides');
    
            } catch (err) {
                console.error("Error submitting onboarding form:", err);
                
                // Check if user exists despite the error
                try {
                    const checkResponse = await fetch(
                        `http://localhost:8000/users/check_email?email=${encodeURIComponent(Cookies.get("user_email"))}`,
                        {
                            credentials: "include"
                        }
                    );
                    
                    if (checkResponse.ok) {
                        const checkData = await checkResponse.json();
                        if (checkData.exists) {
                            console.log("User exists, redirecting to landing...");
                            navigate('/rides');
                            return;
                        }
                    }
                } catch (checkErr) {
                    console.error("Error checking email:", checkErr);
                }
    
                // If we haven't redirected and still have retries left, try again
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retrying submission... Attempt ${retryCount} of ${maxRetries}`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
                    return trySubmit();
                }
    
                alert(`Error: ${err.message}. Please refresh the page and try again.`);
            }
        };
    
        await trySubmit();
    };

    return (
        <div className="container">
            <h2>Onboarding Form</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-item">
                    <label htmlFor="name">Full Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                        minLength={2}
                        maxLength={50}
                        pattern="[A-Za-z\s]+"
                        title="Please enter a valid name (letters and spaces only)"
                    />
                </div>

                <div className="form-item upload-container">
                    <label htmlFor="profilePicture">Upload Profile Picture</label>
                    <input 
                        type="file" 
                        id="profilePicture" 
                        name="profilePicture" 
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileChange}
                    />
                    {profilePicture && (
                        <div style={{ marginTop: '10px' }}>
                            <img 
                                src={profilePicture} 
                                alt="Profile Preview" 
                                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                        </div>
                    )}
                </div>

                <div className="form-item">
                    <label>Are you a Rider or Driver?</label>
                    <div className="radio-group">
                        <label>
                            <input 
                                type="radio" 
                                value="rider" 
                                checked={!isDriver} 
                                onChange={handleRoleChange}
                                name="userType"
                            />
                            Rider
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                value="driver" 
                                checked={isDriver} 
                                onChange={handleRoleChange}
                                name="userType"
                            />
                            Driver
                        </label>
                    </div>
                </div>

                {isDriver && (
                    <div>
                        <div className="form-item">
                            <label htmlFor="vehicleModel">Vehicle Model</label>
                            <input 
                                type="text" 
                                id="vehicleModel"
                                name="vehicleModel" 
                                value={formData.vehicleModel} 
                                onChange={handleChange} 
                                required 
                                minLength={2}
                                maxLength={50}
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
                                pattern="[A-Za-z0-9\s-]+"
                                title="Please enter a valid plate number"
                                maxLength={10}
                            />
                        </div>
                        <div className="form-item">
                            <label htmlFor="vehicleState">State of Registration</label>
                            <input 
                                type="text" 
                                id="vehicleState"
                                name="vehicleState" 
                                value={formData.vehicleState} 
                                onChange={handleChange} 
                                required 
                                pattern="[A-Za-z\s]+"
                                title="Please enter a valid state name"
                                maxLength={20}
                            />
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={isSubmitting ? 'submitting' : ''}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default OnboardingPage;