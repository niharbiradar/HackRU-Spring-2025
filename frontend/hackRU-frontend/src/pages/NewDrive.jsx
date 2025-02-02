import React, { useState } from 'react';
import '../css/drive.css';
import { useNavigate } from "react-router-dom";

const NewDrivePage = () => {
   const navigate = useNavigate();

   // List of available locations (Modify this list as needed)
   const locations = [
       "College Ave Gym - College Ave",
       "The Yard - College Ave",
       "Academic Building - College Ave",
       "Verve - College Ave",
       "Hardenbergh Hall- College Ave",
       "Student Center - Livingston Campus ",
       "Business Building - Livingston Campus",
       "Tillet Hall - Livingston Campus",
       "Quads - Livingston Campus",

       "Allison Road Classrooms - Busch Campus",
       "Student Center - Busch Campus",
       "Hill Center - Busch Campus",
       "Engineering Building - Busch Campus",
       "Stadium - Busch Campus",
       "Hickman Hall - Cook Campus ",
       "Student Center - Cook Campus",
       "Newell Appartments - Cook Campus",
   ];

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
       <div className="drive-container">
           <h2>Submit a Drive</h2>
           <form onSubmit={handleSubmit}>
               {/* Start Location Dropdown */}
               <div className="form-item">
                   <label htmlFor="startLocation">Start Location</label>
                   <select
                       id="startLocation"
                       name="startLocation"
                       value={formData.startLocation}
                       onChange={handleChange}
                       required
                   >
                       <option value="">Select a location</option>
                       {locations.map((location, index) => (
                           <option key={index} value={location}>{location}</option>
                       ))}
                   </select>
               </div>

               {/* End Location Dropdown */}
               <div className="form-item">
                   <label htmlFor="endLocation">End Location</label>
                   <select
                       id="endLocation"
                       name="endLocation"
                       value={formData.endLocation}
                       onChange={handleChange}
                       required
                   >
                       <option value="">Select a location</option>
                       {locations.map((location, index) => (
                           <option key={index} value={location}>{location}</option>
                       ))}
                   </select>
               </div>

               {/* Ride Time */}
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

               {/* Available Seats */}
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

               {/* Total Seats */}
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
