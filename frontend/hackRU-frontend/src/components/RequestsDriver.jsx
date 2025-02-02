import { useState, useEffect } from 'react';
import '../css/requestsDriver.css';

const RequestsDriver = ({ rideId }) => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (rideId) {
            fetchBookingsByRideId(rideId).then((data) => {
                if (data) setBookings(data);
            });
        }
    }, [rideId]);

    const fetchBookingsByRideId = async (rideId) => {
        try {
            if (!rideId) {
                console.error("Ride ID is required.");
                return;
            }
    
            const response = await fetch(`http://localhost:8000/bookings/get_by_ride_id?ride_id=${rideId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    return (
        <div className="requests-container">
            <h2 className="requests-title">Bookings for Ride: {rideId}</h2>
            <ul className="requests-list">
                {bookings.map((booking) => (
                    <li key={booking._id} className="request-item">
                        <span><strong>User:</strong> {booking.rider_name} </span>
                        <span><strong>Seats:</strong> {booking.seats_booked}</span>
                        <span 
                            className={`request-status ${
                                booking.status === "Pending" ? "status-pending" :
                                booking.status === "Accepted" ? "status-accepted" :
                                "status-rejected"
                            }`}
                        >
                            {booking.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RequestsDriver;
