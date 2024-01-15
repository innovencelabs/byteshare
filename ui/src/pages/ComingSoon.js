import React, { useState } from 'react';
import axios from 'axios';
import './css/ComingSoon.css';
import ByteShareSnackbar from '../components/Snackbar';

const ComingSoon = () => {
    const [email, setEmail] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
  
    const axiosClient = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL
    });


  const handleCloseSnackbar = () => {
      setOpenSnackbar(false);
    };
    
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if(email === "") {
      return;
    }

    try {
      const response = await axiosClient.post('/subscribe', { email }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

      console.log('Email added:', response.status===200);

      setEmail('');
      setOpenSnackbar(true);
      
    } catch (error) {
      console.error('Error submitting email:', error);
    }
  };

  return(
    <div className="all-container">
      <div id="logo">
        
      </div>

      <div id="text-container">
        <p id="first-para">BYTE SHARE</p>
        <p id="second-para">COMING</p>
        <p id="third-para">SOON</p>
        <p>
          Join the waiting list here.
        </p>
      </div>

      <form onSubmit={handleEmailSubmit}>
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="submit" value="Go" />
      </form>
      <ByteShareSnackbar open={openSnackbar} handleClose={handleCloseSnackbar} message="Joined the waitlist!" variant="success"/>
    </div>
  );
}

export default ComingSoon;