import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

interface Tournament {
  id: number;
  name: string;
  description: string;
  game_type: string;
  status: string;
  format: string;
}

const TournamentList: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tournaments');
        setTournaments(response.data);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)',
      py: 6,
      px: 0,
    }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#e0e0e0', fontWeight: 700, letterSpacing: 1 }}>
            Tournaments
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/create-tournament"
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.2,
              fontWeight: 700,
              fontSize: 16,
              background: 'linear-gradient(90deg, #3a86ff 60%, #43a047 100%)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(58,134,255,0.10)',
              '&:hover': {
                background: 'linear-gradient(90deg, #265d97 60%, #388e3c 100%)',
              },
            }}
          >
            Create Tournament
          </Button>
        </Box>

        <Grid container spacing={3}>
          {tournaments.map((tournament) => (
            <Grid item xs={12} sm={6} md={4} key={tournament.id}>
              <Card sx={{
                background: 'rgba(34,41,70,0.98)',
                borderRadius: 4,
                boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.18)',
                color: '#e0e0e0',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#b8c1ec', fontWeight: 700 }}>
                    {tournament.name}
                  </Typography>
                  <Typography sx={{ color: '#a0a7c7', fontWeight: 500 }} gutterBottom>
                    {tournament.game_type}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b8c1ec' }}>
                    {tournament.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#43a047', fontWeight: 600 }}>
                    Statut : {tournament.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to={`/tournaments/${tournament.id}`}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(90deg, #3a86ff 60%, #43a047 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      borderRadius: 3,
                      boxShadow: '0 2px 8px rgba(58,134,255,0.10)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #265d97 60%, #388e3c 100%)',
                      },
                    }}
                  >
                    Voir les Détails
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TournamentList; 