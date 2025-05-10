import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [value, setValue] = useState(0);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [tournamentsRes, matchesRes] = await Promise.all([
          axios.get(`http://localhost:5000/users/${user?.id}/tournaments`),
          axios.get(`http://localhost:5000/users/${user?.id}/matches`)
        ]);
        setTournaments(tournamentsRes.data);
        setMatches(matchesRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profil
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Informations</Typography>
            <Typography>Nom d'utilisateur: {user?.username}</Typography>
            <Typography>Email: {user?.email}</Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleTabChange}>
                <Tab label="Informations" />
                <Tab label="Mes Tournois" />
                <Tab label="Historique" />
              </Tabs>
            </Box>
            
            <TabPanel value={value} index={0}>
              <List>
                {tournaments.map((tournament: any) => (
                  <React.Fragment key={tournament.id}>
                    <ListItem>
                      <ListItemText
                        primary={tournament.name}
                        secondary={`Statut: ${tournament.status}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>
            
            <TabPanel value={value} index={1}>
              <List>
                {matches.map((match: any) => (
                  <React.Fragment key={match.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${match.player1?.username} vs ${match.player2?.username}`}
                        secondary={`Score: ${match.score1} - ${match.score2}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </TabPanel>
            
            <TabPanel value={value} index={2}>
              <Typography variant="h6">Statistiques</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">
                      {tournaments.length}
                    </Typography>
                    <Typography>Tournois participés</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">
                      {matches.filter((m: any) => m.status === 'completed').length}
                    </Typography>
                    <Typography>Matchs joués</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 