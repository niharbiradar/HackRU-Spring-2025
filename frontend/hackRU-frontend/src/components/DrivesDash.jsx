import React, { useState, useEffect } from 'react';
import { Space, Card, Button, Collapse, List} from 'antd';
import rides from '../dummyData/rides.json';
import '../css/myDrives.css'; // Import the CSS file
import Swal from 'sweetalert2';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import NewDrivePage from '../pages/NewDrive';

 

function DrivesDash() {
    const navigate = useNavigate();
    const [driverID, setDriverID] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            // Check if user is logged in
            const userEmail = Cookies.get('user_email');
            if (!userEmail) {
                message.error('Please login first');
                navigate('/');
                return;
            }
    
            // Fetch user details first
            try {
                await fetchUser(userEmail);  // Ensure user data is fetched before proceeding
    
                // Now fetch rides based on driver ID
                await fetchRidesbyDriver(driverID);
                console.log(rides);
            } catch (error) {
                console.error("Error during data fetch:", error);
            }
        };
    
        loadData();  // Call the async function
    
    }, [navigate, driverID]);  // Dependencies (navigate, driverID)
    
    const fetchUser = async (email) => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/users/get_user_id?email=' + email, {
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
            console.log("Fetched User:", data); // Debug log
            setDriverID(data.user_id); // Fix here: set driverID directly as a string
        } catch (error) {
            console.error("Error fetching user:", error);
            message.error('Failed to load user');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchRidesbyDriver = async (driverID) => {
    try {
        if (!driverID) {
            message.error('Driver ID is missing');
            return;
        }
        
        setLoading(true);
        console.log("here")
        console.log(driverID)
        const response = await fetch('http://localhost:8000/rides/driver/?driverID='+driverID, {
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
 

    const drive = {
        start_location: "New York, NY",
        end_location: "Boston, MA",
        ride_time: "2024-02-01T15:30:00Z",
        available_seats: 2,
        total_seats: 4,
        vehicle_info: {
            vehicle_type: "SUV",
            license_plate: "XYZ-1234"
        },
        requests: [
            { name: "Alice Johnson", status: "Pending" },
            { name: "Bob Smith", status: "Accepted" },
            { name: "Charlie Brown", status: "Rejected" }
        ]
    };

    const { Panel } = Collapse;
    const [expanded, setExpanded] = useState(false);
    
    
    // Mock Data for Ride Requests
    const rideRequests = [
        { id: 1, title: 'Request 1', description: 'Details about request 1' },
        { id: 2, title: 'Request 2', description: 'Details about request 2' },
        { id: 3, title: 'Request 3', description: 'Details about request 3' },
    ];

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const openAddRideForm = () => {
        Swal.fire({
            title: 'Add New Ride',
            html: `<div id="new-drive-form"></div>`, // Placeholder for form
            showConfirmButton: false,
            showCloseButton: true,
            width: '600px',
            didOpen: () => {
                const container = document.getElementById('new-drive-form');
                if (container) {
                    import('../pages/NewDrive').then(({ default: NewDrivePage }) => {
                        const formElement = document.createElement('div');
                        formElement.innerHTML = `
                            <form id="driveForm">
                                <label>Start Location</label>
                                <input type="text" id="startLocation" required>
                                
                                <label>End Location</label>
                                <input type="text" id="endLocation" required>
                                
                                <label>Ride Time</label>
                                <input type="time" id="rideTime" required>
    
                                <label>Available Seats</label>
                                <input type="number" id="availableSeats" min="1" required>
                                
                                <label>Total Seats</label>
                                <input type="number" id="totalSeats" min="1" required>
                                
                                <button type="submit" id="submitDrive">Submit</button>
                            </form>
                        `;
                        container.appendChild(formElement);
    
                        document.getElementById('submitDrive').addEventListener('click', (e) => {
                            e.preventDefault();
                            Swal.close();
                            console.log("Form Submitted!"); // Replace with actual logic
                        });
                    });
                }
            }
        });
    };
    

    return (
        <div>
            {/* Main Card for Viewing Requests */}
            <div className="mydrives-container">
            {
    rides.map(ride => (
        <Card
            key={ride._id}  // Assuming each ride has a unique _id
            title={`Drive: ${ride.start_location} → ${ride.end_location}`}
            extra={
                <Button type="primary" onClick={toggleExpand}>
                    {expanded ? "Collapse" : "Expand"}
                </Button>
            }
            style={{ width: '150%', maxWidth: '600px', margin: '30px auto' }}
        >
            {/* Main Drive Details */}
            <p><strong>Seats Available:</strong> {ride.available_seats} / {ride.total_seats}</p>
            <p><strong>Vehicle:</strong> {ride.vehicle_info.vehicle_type} ({ride.vehicle_info.license_plate})</p>

            {/* Expandable Requests List */}
            {expanded && (
                <Collapse activeKey={expanded ? "1" : null} style={{ marginTop: '10px' }}>
                    <Panel header="Ride Requests" key="1">
                        <List
                            bordered
                            dataSource={ride.requests}
                            renderItem={request => (
                                <List.Item>
                                    <strong>{request.name}</strong> - {request.status}
                                </List.Item>
                            )}
                        />
                    </Panel>
                </Collapse>
            )}
        </Card>
    ))
}
            </div>

            {/* SpeedDial to Add New Ride */}
        <SpeedDial
                ariaLabel="Add New Ride"
                sx={{ position: "fixed", bottom: 16, right: 16 }}
                icon={<SpeedDialIcon icon={<AddCircleOutlineIcon />} />}
            >
            <SpeedDialAction
                icon={<AddCircleOutlineIcon />}
                tooltipTitle="Add New Ride"
                onClick={(e) => {
                e.stopPropagation(); // Prevents double trigger
                openAddRideForm();
            }}
            />
        </SpeedDial>


        </div>
    );
}

export default DrivesDash;
