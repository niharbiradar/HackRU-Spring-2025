import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, Typography, Button, Spin, Alert, Tag, Modal, Row, Col, message 
} from 'antd';
import { 
  ClockCircleOutlined, CarOutlined, CheckCircleOutlined, 
  EnvironmentOutlined, InfoCircleOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const RideCard = ({ ride, type, onRequestRide, onShowDriverDetails }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  
  const handleRequestRide = async () => {
    setIsRequesting(true);
    try {
      const bookingResponse = await fetch('http://localhost:8000/bookings/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ride_id: ride.ride_id,
          status: 'confirmed',
          seats_booked: 1,
          pickup_location: ride.start_location
        })
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to request ride');
      }

      onRequestRide(ride);
      message.success('Ride confirmed successfully!');
    } catch (error) {
      console.error('Ride request error:', error);
      message.error('Failed to request ride');
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return 'green';
      case 'confirmed':
      case 'scheduled': return 'blue';
      case 'completed': return 'gray';
      case 'canceled': return 'red';
      default: return 'orange';
    }
  };

  return (
    <Card 
      hoverable
      className="h-full"
      bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      style={{ 
        marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: 8
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 16 
      }}>
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
            <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {ride.start_location}
          </Title>
          <Title level={4} style={{ margin: 0, color: '#666' }}>
            <EnvironmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            {ride.end_location}
          </Title>
        </div>
        <Tag color={getStatusColor(ride.status)} style={{ padding: '4px 8px' }}>
          {ride.status.toUpperCase()}
        </Tag>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {new Date(ride.ride_time || ride.created_at).toLocaleString()}
          </Text>
        </div>

        {ride.vehicle_info && (
          <div style={{ marginBottom: 16 }}>
            <Text>
              <CarOutlined style={{ marginRight: 8 }} />
              {ride.vehicle_info.model} (Plate: {ride.vehicle_info.plate})
            </Text>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        {type === 'available' ? (
          <Button 
            type="primary" 
            block
            size="large"
            disabled={isRequesting}
            loading={isRequesting}
            onClick={handleRequestRide}
            style={{ height: 40 }}
          >
            {isRequesting ? 'Confirming...' : 'Confirm Ride'}
          </Button>
        ) : (
          <Button
            block
            size="large"
            icon={<InfoCircleOutlined />}
            onClick={() => onShowDriverDetails(ride.vehicle_info)}
            style={{ height: 40 }}
          >
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
};

const RideSection = ({ title, icon: Icon, rides, type, onRequestRide, onShowDriverDetails }) => (
  <div style={{ marginBottom: 32 }}>
    <Title level={3} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      marginBottom: 24,
      padding: '8px 0',
      borderBottom: '2px solid #f0f0f0'
    }}>
      <Icon style={{ color: '#1890ff' }} />
      {title} ({rides.length})
    </Title>
    <Row gutter={[16, 16]}>
      {rides.map(ride => (
        <Col xs={24} lg={8} key={ride.ride_id}>
          <RideCard
            ride={ride}
            type={type}
            onRequestRide={onRequestRide}
            onShowDriverDetails={onShowDriverDetails}
          />
        </Col>
      ))}
    </Row>
  </div>
);

const RidesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rides, setRides] = useState([]);
  const [selectedDriverDetails, setSelectedDriverDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/rides', { 
          credentials: 'include' 
        });
        if (!response.ok) {
          throw new Error('Failed to fetch rides');
        }
        const data = await response.json();
        setRides(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const handleRequestRide = (requestedRide) => {
    setRides(prevRides => prevRides.map(ride =>
      ride.ride_id === requestedRide.ride_id 
        ? { ...ride, status: 'confirmed' } 
        : ride
    ));
  };

  const showDriverDetails = (driverDetails) => {
    setSelectedDriverDetails(driverDetails);
    setModalVisible(true);
  };

  const availableRides = useMemo(() => rides.filter(ride => ride.status === 'available'), [rides]);
  const activeRides = useMemo(() => rides.filter(ride => ['scheduled', 'confirmed'].includes(ride.status)), [rides]);
  const pastRides = useMemo(() => rides.filter(ride => ['completed', 'canceled'].includes(ride.status)), [rides]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Rides"
        description={error}
        type="error"
        style={{ maxWidth: 800, margin: '32px auto' }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Title level={2} style={{ marginBottom: 32, textAlign: 'center' }}>
        Your Rides Dashboard
      </Title>
      
      <RideSection
        title="Available Rides"
        icon={ClockCircleOutlined}
        rides={availableRides}
        type="available"
        onRequestRide={handleRequestRide}
        onShowDriverDetails={showDriverDetails}
      />
      
      <RideSection
        title="Active Rides"
        icon={CarOutlined}
        rides={activeRides}
        type="active"
        onRequestRide={handleRequestRide}
        onShowDriverDetails={showDriverDetails}
      />
      
      <RideSection
        title="Past Rides"
        icon={CheckCircleOutlined}
        rides={pastRides}
        type="past"
        onRequestRide={handleRequestRide}
        onShowDriverDetails={showDriverDetails}
      />

      <Modal
        title="Vehicle Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedDriverDetails && (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Text strong>Vehicle Model: </Text>
              <Text>{selectedDriverDetails.model}</Text>
            </Col>
            <Col span={24}>
              <Text strong>License Plate: </Text>
              <Text>{selectedDriverDetails.plate}</Text>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default RidesPage;