import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Empty, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import '../css/rides.css';

const Rides = () => {
    const navigate = useNavigate();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const userEmail = Cookies.get('user_email');
        if (!userEmail) {
            message.error('Please login first');
            navigate('/');
            return;
        }
        fetchRides();
    }, [navigate]);

    const fetchRides = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/rides/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched rides:", data); // Debug log
            setRides(data);

        } catch (error) {
            console.error("Error fetching rides:", error);
            message.error('Failed to load rides');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestRide = async (rideId) => {
        try {
            const userEmail = Cookies.get('user_email');
            const response = await fetch('http://localhost:8000/bookings/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ride_id: rideId,
                    rider_email: userEmail
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            message.success('Ride requested successfully!');
            fetchRides(); // Refresh rides list
        } catch (error) {
            console.error("Error requesting ride:", error);
            message.error('Failed to request ride');
        }
    };

    const showDriverDetails = (ride) => {
        Swal.fire({
            title: `Driver: ${ride.driver_name}`,
            html: `
                <div class="driver-details">
                    ${ride.driver_picture ? 
                        `<img src="${ride.driver_picture}" alt="Driver" 
                         style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 10px;">` 
                        : ''}
                    <div class="driver-info">
                        <p><strong>Vehicle Details:</strong></p>
                        <p>Model: ${ride.vehicle_info?.model || 'N/A'}</p>
                        <p>Plate: ${ride.vehicle_info?.plate || 'N/A'}</p>
                        <p>State: ${ride.vehicle_info?.state || 'N/A'}</p>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Close',
            customClass: {
                container: 'driver-modal'
            }
        });
    };

    const formatDateTime = (dateTimeStr) => {
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error("Date formatting error:", error);
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
                <p>Loading rides...</p>
            </div>
        );
    }

    if (!rides || rides.length === 0) {
        return (
            <div className="empty-container">
                <Empty 
                    description={
                        <span>No rides available at the moment</span>
                    }
                />
            </div>
        );
    }

    return (
        <div className="rides-page">
            <div className="page-header">
                <h1>Available Rides ({rides.length})</h1>
                <p>Click on driver's name to see more details</p>
            </div>
            
            <div className="card-container">
                {rides.map((ride) => (
                    <Card
                        key={ride._id}
                        className={`ride-card ${ride.status}`}
                        title={
                            <span
                                className="driver-name-link"
                                onClick={() => showDriverDetails(ride)}
                            >
                                Driver: {ride.driver_name}
                            </span>
                        }
                        extra={
                            <Button 
                                type="primary"
                                onClick={() => handleRequestRide(ride.ride_id)}
                                disabled={ride.status !== 'scheduled' || ride.available_seats < 1}
                                className={ride.status}
                            >
                                {ride.status === 'scheduled' ? 'Request Ride' : ride.status}
                            </Button>
                        }
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div className="ride-details">
                                <div className="ride-info">
                                    <p className="location">
                                        <strong>From:</strong> {ride.start_location}
                                    </p>
                                    <p className="location">
                                        <strong>To:</strong> {ride.end_location}
                                    </p>
                                    <p className="datetime">
                                        <strong>Departure:</strong> {formatDateTime(ride.ride_time)}
                                    </p>
                                    <p className={`status status-${ride.status}`}>
                                        <strong>Status:</strong> {ride.status}
                                    </p>
                                    <p className="seats">
                                        <strong>Seats Available:</strong> {ride.available_seats}/{ride.total_seats}
                                    </p>
                                    {ride.vehicle_info && (
                                        <p className="vehicle">
                                            <strong>Vehicle:</strong> {ride.vehicle_info.model}
                                            {ride.vehicle_info.plate && ` (${ride.vehicle_info.plate})`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Space>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Rides;