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
  start_date: string;
  end_date: string;
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Tournaments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/create-tournament"
        >
          Create Tournament
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tournaments.map((tournament) => (
          <Grid item xs={12} sm={6} md={4} key={tournament.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {tournament.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {tournament.game_type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tournament.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Status: {tournament.status}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={RouterLink}
                  to={`/tournaments/${tournament.id}`}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TournamentList; 