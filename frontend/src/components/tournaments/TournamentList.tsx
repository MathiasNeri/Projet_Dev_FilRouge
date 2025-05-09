import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
      <Typography variant="h4" gutterBottom>
        Tournois Disponibles
      </Typography>
      
      <Grid container spacing={3}>
        {tournaments.map((tournament) => (
          <Grid item xs={12} md={6} key={tournament.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {tournament.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {tournament.game_type}
                </Typography>
                <Typography variant="body2" paragraph>
                  {tournament.description}
                </Typography>
                <Chip 
                  label={tournament.status} 
                  color={tournament.status === 'active' ? 'success' : 'default'}
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={tournament.format} 
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                  sx={{ mt: 2 }}
                >
                  Voir les Détails
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TournamentList; 