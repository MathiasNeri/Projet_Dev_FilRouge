import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 2, sm: 6 },
      px: { xs: 1, sm: 0 },
    }}>
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={6} sx={{
          p: { xs: 2, sm: 6 },
          borderRadius: 6,
          background: 'rgba(245,247,251,0.98)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 500,
        }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ color: '#3d155f', fontWeight: 800, mb: 2, textAlign: 'center', letterSpacing: 1, fontSize: { xs: 28, sm: 40 } }}>
            Plateforme de Tournois
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom color="text.secondary" sx={{ color: '#6b7280', mb: 4, textAlign: 'center', fontSize: { xs: 16, sm: 24 } }}>
            Créez, rejoignez et gérez vos tournois
          </Typography>
          <Box sx={{ mt: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/tournaments"
                sx={{
                  borderRadius: 3,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 700,
                  fontSize: { xs: 16, sm: 18 },
                  background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0 60%, #388e3c 100%)',
                  },
                }}
              >
                Voir les Tournois
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{
                  borderRadius: 3,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 700,
                  fontSize: { xs: 16, sm: 18 },
                  background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0 60%, #388e3c 100%)',
                  },
                }}
              >
                Commencer
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home; 