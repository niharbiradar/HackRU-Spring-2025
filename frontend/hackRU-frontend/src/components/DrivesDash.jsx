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
import RequestsDriver from './RequestsDriver';



function timeToISOString(time) {
    // Get today's date
    let today = new Date();
    
    // Extract the year, month, and day
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
    let day = String(today.getDate()).padStart(2, '0'); // Ensure 2-digit day
    
    // Construct the ISO-like date-time string
    let isoString = `${year}-${month}-${day}T${time}:00`;

    return isoString;
}

function DrivesDash() {
    const navigate = useNavigate();
    const [driverID, setDriverID] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [driverData, setDriverData] = useState(null);

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

                await fetchDriverInfo(userEmail);
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
        // console.log("here")
        // console.log(driverID)
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

const fetchDriverInfo = async (email) => {
    try {
        if (!driverID) {
            message.error('Driver ID is missing');
            return;
        }
        
        setLoading(true);
        // console.log("here")
        // console.log(driverID)
        const response = await fetch('http://localhost:8000/users/get_user_details?email=' + email, {
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
        console.log("Fetched date about Driver:", data); // Debug log
        setDriverData(data);

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
    
                        document.getElementById('driveForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            
                            const startLocation = document.getElementById('startLocation').value;
                            const endLocation = document.getElementById('endLocation').value;
                            const rideTime = document.getElementById('rideTime').value;
                            const availableSeats = document.getElementById('availableSeats').value;
                            const totalSeats = document.getElementById('totalSeats').value;
    
                            // Ensure rideTime is properly formatted
                            // const rideDateTime = new Date(`1970-01-01T${rideTime}:00Z`);
                            console.log(rideTime)
                            const dateObj = timeToISOString(rideTime);
                            console.log(dateObj)
                            const isoString = dateObj
                            console.log("times")
                            console.log(isoString);

                            // const driveData = {
                            //     ride_id: generateUUID(),
                            //     driver_id: "2b63b92f-41b7-4673-9b5d-c4dd199034c6", // Replace with actual driver ID
                            //     driver_name: "Test Driver MM", // Replace with actual driver name
                            //     driver_picture: null, // Replace with actual driver picture URL
                            //     start_location: startLocation,
                            //     end_location: endLocation,
                            //     ride_time: "1989-02-02T12:30:00",
                            //     status: "scheduled",
                            //     available_seats: parseInt(availableSeats),
                            //     total_seats: parseInt(totalSeats),
                            //     vehicle_info: {
                            //         type: "sedan/suv", // Replace with actual vehicle type
                            //         model: "Toyota Corolla", // Replace with actual vehicle model
                            //         plate: "ABC123", // Replace with actual vehicle plate
                            //         state: "NJ" // Replace with actual vehicle state
                            //     },
                            //     created_at: new Date().toISOString()
                            // };

                            const driveData = {
                                ride_id: generateUUID(),
                                driver_id: driverID, 
                                driver_name: driverData['name'], // same thing
                                driver_picture: null,
                                start_location: startLocation,
                                end_location: endLocation,
                                ride_time: isoString, // get this from the form
                                status: "scheduled",
                                available_seats: parseInt(availableSeats),
                                total_seats: parseInt(totalSeats),
                                vehicle_info: {
                                    type: "sedan/suv",
                                    model: driverData['vehicle_info']['model'],
                                    plate: driverData['vehicle_info']['plate'],
                                    state: driverData['vehicle_info']['state']
                                    // get this from the user
                                },
                                created_at: new Date().toISOString()
                            }
    
                            try {
                                console.log("Drive Data:", driveData);
                                const response = await fetch("http://localhost:8000/rides/addRide", {
                                    method: "POST",
                                    credentials: "include",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(driveData),
                                });
                    
                                if (response.ok) {
                                    Swal.close();
                                    alert('Drive posted successfully!');
                                } else {
                                    alert('Failed to post drive.');
                                }
                    
                                const data = await response.json();
                                console.log("New Drive successful:", data);
    
                            }catch (err) {
                                console.error("Error submitting onboarding form:", err);
                            }
                        });
                    });
                }
            }
        });
    };
    
    function generateUUID() {
        // Generate a UUID for the ride_id
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

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
            <p><strong>Vehicle:</strong> {ride.vehicle_info.type} ({ride.vehicle_info.plate})</p>

            {/* Expandable Requests List */}
            {expanded && (
                <Collapse activeKey={expanded ? "1" : null} style={{ marginTop: '10px' }}>
                    <Panel header="Ride Requests" key="1">
                        <RequestsDriver rideId={ride._id} />
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
