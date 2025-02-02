import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Empty, message, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import '../css/rides.css';

const { Title, Text } = Typography;

const Rides = () => {
  const navigate = useNavigate();
  const [ridesData, setRidesData] = useState({
    rides: [],
    bookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userEmail = Cookies.get('user_email');
    if (!userEmail) {
      message.error('Please login first');
      navigate('/');
      return;
    }
    fetchRidesAndBookings();
  }, [navigate]);

  const fetchRidesAndBookings = async () => {
    try {
      setLoading(true);
      // Fetch rides from rides endpoint
      const ridesResponse = await fetch('http://localhost:8000/rides/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Fetch bookings from bookings endpoint
      const bookingsResponse = await fetch('http://localhost:8000/bookings/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!ridesResponse.ok || !bookingsResponse.ok) {
        throw new Error(`HTTP error! rides: ${ridesResponse.status}, bookings: ${bookingsResponse.status}`);
      }

      const rides = await ridesResponse.json();
      const bookings = await bookingsResponse.json();

      setRidesData({ rides, bookings });
    } catch (error) {
      console.error("Error fetching rides and bookings:", error);
      message.error('Failed to load rides and bookings');
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
          rider_email: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Ride requested successfully!');
      fetchRidesAndBookings(); // Refresh rides list
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
        container: 'driver-modal',
      },
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
        hour12: true,
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Invalid Date';
    }
  };

  const filterRidesByStatus = (statuses) => {
    return ridesData.rides.filter((ride) => 
      statuses.includes(ride.status.toLowerCase())
    );
  };

  const filterBookingsByStatus = (statuses) => {
    return ridesData.bookings.filter((booking) => 
      statuses.includes(booking.status.toLowerCase())
    );
  };

  const renderRideCard = (ride) => (
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
        ride.status === 'available' ? (
          <Button
            type="primary"
            onClick={() => handleRequestRide(ride.ride_id)}
            disabled={ride.available_seats < 1}
            className={ride.status}
          >
            Request Ride
          </Button>
        ) : (
          <Text type="secondary" className={`status status-${ride.status}`}>
            {ride.status}
          </Text>
        )
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
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Loading rides...</p>
      </div>
    );
  }

  if (!ridesData.rides.length && !ridesData.bookings.length) {
    return (
      <div className="empty-container">
        <Empty description={<span>No rides or bookings available at the moment</span>} />
      </div>
    );
  }

  return (
    <div className="rides-page">
      <div className="page-header">
        <Title level={2}>Available Rides</Title>
        <Text type="secondary">Click on the driver's name to see more details</Text>
      </div>

      {/* Section 1: Available Rides */}
      <div className="rides-section">
        <Title level={4}>Available Rides</Title>
        <div className="card-container">
          {filterRidesByStatus(['available']).length > 0 ? (
            filterRidesByStatus(['available']).map((ride) => renderRideCard(ride))
          ) : (
            <Empty description="No available rides" />
          )}
        </div>
      </div>

      {/* Section 2: Active Rides */}
      <div className="rides-section">
        <Title level={4}>Active Rides</Title>
        <div className="card-container">
          {filterBookingsByStatus(['scheduled']).length > 0 ? (
            filterBookingsByStatus(['scheduled']).map((booking) => {
              const ride = ridesData.rides.find(ride => ride.ride_id === booking.ride_id);
              return ride && renderRideCard(ride);
            })
          ) : (
            <Empty description="No active rides" />
          )}
        </div>
      </div>

      {/* Section 3: Completed/Rejected/Canceled Rides */}
      <div className="rides-section">
        <Title level={4}>Completed, Rejected, or Canceled Rides</Title>
        <div className="card-container">
          {filterBookingsByStatus(['completed', 'rejected', 'canceled']).length > 0 ? (
            filterBookingsByStatus(['completed', 'rejected', 'canceled']).map((booking) => {
              const ride = ridesData.rides.find(ride => ride.ride_id === booking.ride_id);
              return ride && renderRideCard(ride);
            })
          ) : (
            <Empty description="No completed, rejected, or canceled rides" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Rides;
