import React from 'react';
import { Space, Card, Button } from 'antd';
import rides from '../dummyData/rides.json';
import '../css/rides.css'; // Import the CSS file
import Swal from 'sweetalert2'
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";


function DrivesDash() {

    const actions = [
        { icon: <AddCircleOutlineIcon />, name: 'Add New Ride' }
      ];
      
      return (

        <div>
            <div className="rides-container">
                <h2>My Drives</h2>
            </div>

            <SpeedDial
            ariaLabel="Add New Ride"
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            icon={<SpeedDialIcon icon={<AddCircleOutlineIcon />} />}
            >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
          />
        ))}
            </SpeedDial>
        </div>

      );
}

export default DrivesDash;
