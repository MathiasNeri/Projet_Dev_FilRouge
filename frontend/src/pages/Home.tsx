import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Tournament Platform
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Create, join, and manage your tournaments
        </Typography>
        <Box sx={{ mt: 4 }}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/tournaments"
            >
              View Tournaments
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/register"
            >
              Get Started
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 