import React, { useState } from 'react';
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

 

function DrivesDash() {
    const [driverID, setDriverID] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDriverID = async () => {
        try {
            const emailAddress = Cookies.get("user_email");
            if (!emailAddress) {
                message.error('Please login first');
                navigate('/');
            }

            setLoading(true);
            const response = await fetch('http://localhost:8000/drivers/', {
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
            setDriverID(data);

        } catch (error) {
            console.error("Error fetching rides:", error);
            message.error('Failed to load rides');
        } finally {
            setLoading(false);
        }
    };

    const fetchRidesbyDriver = async () => {
        try {
            const emailAddress = Cookies.get("user_email");
            if (!emailAddress) {
                message.error('Please login first');
                navigate('/');
            }

            setLoading(true);
            const response = await fetch('http://localhost:8000/rides/driver/<string:driver_id>', {
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

    return (
        <div>
            {/* Main Card for Viewing Requests */}
            <div className="mydrives-container">
            <Card
            title={`Drive: ${drive.start_location} → ${drive.end_location}`}
            extra={
                <Button type="primary" onClick={toggleExpand}>
                    {expanded ? "Collapse" : "Expand"}
                </Button>
            }
            style={{ width: '150%', maxWidth: '600px', margin: '30px auto' }}
        >
            {/* Main Drive Details */}
            <p><strong>Ride Time:</strong> {new Date(drive.ride_time).toLocaleString()}</p>
            <p><strong>Seats Available:</strong> {drive.available_seats} / {drive.total_seats}</p>
            <p><strong>Vehicle:</strong> {drive.vehicle_info.vehicle_type} ({drive.vehicle_info.license_plate})</p>

            {/* Expandable Requests List */}
            {expanded && (
                <Collapse activeKey={expanded ? "1" : null} style={{ marginTop: '10px' }}>
                    <Panel header="Ride Requests" key="1">
                        <List
                            bordered
                            dataSource={drive.requests}
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
            </div>

            {/* SpeedDial to Add New Ride */}
            <SpeedDial
                ariaLabel="Add New Ride"
                sx={{ position: "fixed", bottom: 16, right: 16 }}
                icon={<SpeedDialIcon icon={<AddCircleOutlineIcon />} />}
                onClick={() => Swal.fire("Feature Coming Soon!", "This will allow adding a new ride.", "info")}
            >
                <SpeedDialAction
                    icon={<AddCircleOutlineIcon />}
                    tooltipTitle="Add New Ride"
                    onClick={() => Swal.fire("Feature Coming Soon!", "This will allow adding a new ride.", "info")}
                />
            </SpeedDial>
        </div>
    );
}

export default DrivesDash;
