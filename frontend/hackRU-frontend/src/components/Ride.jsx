import React from 'react';
import { Space, Card, Button } from 'antd';
import rides from '../dummyData/rides.json';
import '../css/rides.css'; // Import the CSS file
import Swal from 'sweetalert2'
import { v4 as uuidv4 } from 'uuid';

function Ride() {

    const showAlert = (ride) => {
        //write command to get driver details based on the driver id
        Swal.fire({
          title: `Ride Details for ${ride.driver_name}`,
          text: `
           Info about the driver
          `,
          icon: 'info', // You can use 'warning', 'info', 'success', etc.
          confirmButtonText: 'OK'
        });
      };

      const requestRide = async (ride) => {
        try {
            // Fetch ride details based on ride_id
            const rideResponse = await fetch(`http://localhost:8000/rides/${ride.ride_id}`);
            if (!rideResponse.ok) {
                throw new Error('Failed to fetch ride details');
            }
            const rideDetails = await rideResponse.json();

            // Fetch user details based on user_id
            const userResponse = await fetch(`http://localhost:8000/users/${rideDetails.driver_id}`);
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user details');
            }
            const userDetails = await userResponse.json();

            // Generate a random booking_id
            const booking_id = uuidv4();

            // Use ride and user details to make the booking request
            const bookingResponse = await fetch('http://localhost:8000/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    booking_id: booking_id, // Include the random booking_id
                    ride_id: rideDetails.ride_id,
                    rider_id: userDetails.user_id, // Use user_id as rider_id
                    rider_name: userDetails.name, // Use name as rider_name
                    rider_picture: userDetails.profile_picture, // Use profile_picture as rider_picture
                    driver_id: rideDetails.driver_id,
                    status: 'pending', // Hard coded to pending
                    seats_booked: 1, // Assuming 1 seat is booked for simplicity
                    pickup_location: rideDetails.start_location,
                    emergency_contact: userDetails.emergency_contacts[0], // Use the first emergency contact
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });

            if (!bookingResponse.ok) {
                throw new Error('Network response was not ok');
            }

            await bookingResponse.json();
            Swal.fire({
                title: 'Success',
                text: 'Your ride has been booked successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'There was an error booking your ride. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };



    return (
        <div className="card-container">
            {rides.map((ride) => (
                <Card
                    key={ride._id} // Unique key for each card
                    title={
                        <span
                            style={{ cursor: 'pointer', color: '#1890ff' }} 
                            onClick={(e) => {
                            e.stopPropagation(); 
                            showAlert(ride); 
                            }}>
                        Driver: {ride.driver_name}
                        </span>
                    }
                    extra={<Button onClick={() => requestRide(ride)}>Request Ride</Button>}
                    style={{ width: '100%' }} // Responsive width
                >
                    <p><strong>Start:</strong> {ride.start_location}</p>
                    <p><strong>End:</strong> {ride.end_location}</p>
                    <p><strong>Ride Time:</strong> {new Date(ride.ride_time).toLocaleString()}</p>
                    <p><strong>Seats Available:</strong> {ride.available_seats}/{ride.total_seats}</p>
                    <p><strong>Vehicle:</strong> {ride.vehicle_info.vehicle_type} ({ride.vehicle_info.license_plate})</p>
                </Card>
            ))}
        </div>
    );
}

export default Ride;
