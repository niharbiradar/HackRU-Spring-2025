import React from 'react';
import { Space, Card, Button } from 'antd';
import rides from '../dummyData/rides.json';
import '../css/rides.css'; // Import the CSS file
import Swal from 'sweetalert2'

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
                    extra={<Button>Request Ride</Button>}
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
