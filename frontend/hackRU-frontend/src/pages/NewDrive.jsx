import React, { useState } from 'react';
import '../css/drive.css'; // Ensure your CSS file is updated for better width
import { useNavigate } from "react-router-dom";

const NewDrivePage = () => {
   const navigate = useNavigate();
   const [formData, setFormData] = useState({
       startLocation: '',
       endLocation: '',
       rideTime: '',
       availableSeats: '',
       totalSeats: '',
   });

   const handleChange = (e) => {
       const { name, value } = e.target;
       setFormData(prevData => ({
           ...prevData,
           [name]: value
       }));
   };

   const handleSubmit = (e) => {
       e.preventDefault();
       console.log("Form Data Submitted:", formData);
       navigate('/landing'); // Redirect after submission
   };

   return (
       <div className="drive-container"> {/* Updated class for better styling */}
           <h2>Start a Drive</h2>
           <form onSubmit={handleSubmit}>
               <div className="form-item">
                   <label htmlFor="startLocation">Start Location</label>
                   <input
                       type="text"
                       id="startLocation"
                       name="startLocation"
                       value={formData.startLocation}
                       onChange={handleChange}
                       required
                   />
               </div>

               <div className="form-item">
                   <label htmlFor="endLocation">End Location</label>
                   <input
                       type="text"
                       id="endLocation"
                       name="endLocation"
                       value={formData.endLocation}
                       onChange={handleChange}
                       required
                   />
               </div>

               <div className="form-item">
                   <label htmlFor="rideTime">Ride Time</label>
                   <input
                       type="time"
                       id="rideTime"
                       name="rideTime"
                       value={formData.rideTime}
                       onChange={handleChange}
                       required
                   />
               </div>

               <div className="form-item">
                   <label htmlFor="availableSeats">Available Seats</label>
                   <input
                       type="number"
                       id="availableSeats"
                       name="availableSeats"
                       min="1"
                       value={formData.availableSeats}
                       onChange={handleChange}
                       required
                   />
               </div>

               <div className="form-item">
                   <label htmlFor="totalSeats">Total Seats</label>
                   <input
                       type="number"
                       id="totalSeats"
                       name="totalSeats"
                       min="1"
                       value={formData.totalSeats}
                       onChange={handleChange}
                       required
                   />
               </div>

               <button type="submit">Submit</button>
           </form>
       </div>
   );
};

export default NewDrivePage;
