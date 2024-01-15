import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import Typography from '@mui/material/Typography';

const NotFoundContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  textAlign: 'center',
});

const ErrorText = styled(Typography)({
  fontSize: '6rem',
});

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      navigate('/');
    }, 7000); // Redirect after 7 seconds (7000 milliseconds)

    return () => clearTimeout(redirectTimeout);
  }, [navigate]);

  return (
    <NotFoundContainer>
      <ErrorText variant="h1">404</ErrorText>
      <Typography variant="h4">Page not found</Typography>
      <Typography variant="body1">You will be redirected to the homepage shortly...</Typography>
    </NotFoundContainer>
  );
};

export default NotFound;
