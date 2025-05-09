import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface Tournament {
  id: number;
  name: string;
  description: string;
  game_type: string;
  status: string;
  start_date: string;
  end_date: string;
  format: string;
  creator_id: number;
  participants: Array<{
    id: number;
    username?: string;
    user_id?: number;
    status: string;
    email?: string;
  }>;
}

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [addUserId, setAddUserId] = useState('');
  const [addUserEmail, setAddUserEmail] = useState('');
  const [joinRequestStatus, setJoinRequestStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
        setTournament(response.data);
        setEditData(response.data);
      } catch (error) {
        console.error('Error fetching tournament:', error);
      }
    };
    fetchTournament();
  }, [id, user]);

  const handleJoin = async () => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/join`);
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await axios.delete(`http://localhost:5000/tournaments/${id}`);
      navigate('/tournaments');
    } catch (error) {
      alert('Error deleting tournament');
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/tournaments/${id}`, editData);
      setEditMode(false);
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      alert('Error updating tournament');
    }
  };

  const handleAddParticipant = async () => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/add_participant`, { email: addUserEmail });
      setAddUserEmail('');
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      alert('Error adding participant');
    }
  };

  const handleRequestJoin = async () => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/request_join`);
      setJoinRequestStatus('pending');
    } catch (error: any) {
      setJoinRequestStatus(error?.response?.data?.error || 'error');
    }
  };

  const handleAcceptReject = async (participantId: number, action: 'accept' | 'reject') => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/handle_request`, { participant_id: participantId, action });
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      alert('Error updating request');
    }
  };

  const handleLeave = async () => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/leave`);
      navigate('/tournaments');
    } catch (error) {
      alert('Error leaving tournament');
    }
  };

  const handleKick = async (participantId: number) => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/kick`, { participant_id: participantId });
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      alert('Error kicking participant');
    }
  };

  if (!tournament) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const isCreator = user && Number(user.id) === Number(tournament.creator_id);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, background: '#f5f6fa', borderRadius: 3, boxShadow: 3, pb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, background: '#f0f1f5', borderRadius: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2d3a4b' }}>
          {tournament.name}
        </Typography>
        {isCreator && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="outlined" color="primary" onClick={() => setEditMode((v) => !v)}>
              {editMode ? 'Cancel Edit' : 'Edit'}
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        )}
        {editMode ? (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <input
                  type="text"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  type="text"
                  value={editData.game_type}
                  onChange={e => setEditData({ ...editData, game_type: e.target.value })}
                  placeholder="Game Type"
                />
              </Grid>
              <Grid item xs={12}>
                <textarea
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Description"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  type="number"
                  value={editData.max_participants}
                  onChange={e => setEditData({ ...editData, max_participants: e.target.value })}
                  placeholder="Max Participants"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  type="text"
                  value={editData.format}
                  onChange={e => setEditData({ ...editData, format: e.target.value })}
                  placeholder="Format"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  type="datetime-local"
                  value={editData.start_date?.slice(0, 16)}
                  onChange={e => setEditData({ ...editData, start_date: e.target.value })}
                  placeholder="Start Date"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  type="datetime-local"
                  value={editData.end_date?.slice(0, 16)}
                  onChange={e => setEditData({ ...editData, end_date: e.target.value })}
                  placeholder="End Date"
                />
              </Grid>
            </Grid>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleEdit}>
              Save
            </Button>
          </Box>
        ) : null}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom sx={{ color: '#2d3a4b' }}>
              Details
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: '#3a3a3a' }}>
              {tournament.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Game Type: {tournament.game_type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Format: {tournament.format}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {tournament.status}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start Date: {new Date(tournament.start_date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              End Date: {new Date(tournament.end_date).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ color: '#2d3a4b' }}>
              Participants
            </Typography>
            <List sx={{ background: '#e9eaf0', borderRadius: 2, boxShadow: 1 }}>
              {tournament.participants.map((participant) => (
                <React.Fragment key={participant.id}>
                  <ListItem
                    secondaryAction={
                      isCreator && participant.status === 'accepted' && String(participant.user_id) !== String(user?.id) ? (
                        <Tooltip title="Exclure ce participant">
                          <Button size="small" color="error" onClick={() => handleKick(participant.id)} sx={{ minWidth: 36 }}>
                            <HighlightOffIcon />
                          </Button>
                        </Tooltip>
                      ) : null
                    }
                    sx={{ bgcolor: participant.status === 'pending' ? '#fffbe6' : '#f0f1f5', borderRadius: 1, mb: 1 }}
                  >
                    <ListItemText
                      primary={participant.username || participant.email || participant.user_id}
                      secondary={participant.status}
                    />
                    {isCreator && participant.status === 'pending' && (
                      <>
                        <Tooltip title="Accepter la demande">
                          <Button size="small" color="success" onClick={() => handleAcceptReject(participant.id, 'accept')} sx={{ minWidth: 36 }}>
                            ✓
                          </Button>
                        </Tooltip>
                        <Tooltip title="Refuser la demande">
                          <Button size="small" color="error" onClick={() => handleAcceptReject(participant.id, 'reject')} sx={{ minWidth: 36 }}>
                            ✗
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            {isCreator && (
              <Box sx={{ mt: 2 }}>
                <input
                  type="email"
                  placeholder="Email to add"
                  value={addUserEmail}
                  onChange={e => setAddUserEmail(e.target.value)}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginRight: 8 }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleAddParticipant}
                  disabled={!addUserEmail}
                  sx={{ background: '#2d3a4b', color: '#fff' }}
                >
                  Add Participant
                </Button>
              </Box>
            )}
            {user && !isCreator && tournament.participants.some(p => String(p.user_id) === String(user.id) && p.status === 'accepted') && (
              <Box sx={{ mt: 2 }}>
                <Tooltip title="Quitter le tournoi">
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={handleLeave}
                    startIcon={<ExitToAppIcon />}
                    sx={{ fontWeight: 600, borderWidth: 2 }}
                  >
                    Quit Tournament
                  </Button>
                </Tooltip>
              </Box>
            )}
            {user && tournament.status === 'pending' && !isCreator && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleRequestJoin}
                  disabled={joinRequestStatus === 'pending'}
                  sx={{ background: '#2d3a4b', color: '#fff' }}
                >
                  {joinRequestStatus === 'pending' ? 'Request Sent' : 'Request to Join'}
                </Button>
                {joinRequestStatus && joinRequestStatus !== 'pending' && (
                  <Typography color="error" variant="body2">{joinRequestStatus}</Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        {isCreator && (
          <Box sx={{ mt: 4, mb: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>Gestion du tournoi</Typography>
            <Typography variant="subtitle1">Équipes / Joueurs et Slots</Typography>
            <List>
              {tournament.participants.filter(p => p.status === 'accepted').map((participant, idx) => (
                <React.Fragment key={participant.id}>
                  <ListItem>
                    <ListItemText
                      primary={`Slot ${idx + 1} : ${participant.username || participant.email || participant.user_id}`}
                      secondary={`ID: ${participant.user_id}`}
                    />
                    {/* Ici, tu pourrais ajouter un champ pour modifier le nom d'équipe ou du joueur */}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Scores / Gagnant</Typography>
            <Typography variant="body2" color="text.secondary">(À personnaliser selon le format du tournoi)</Typography>
            {/* Exemple d'édition manuelle d'un score ou d'un gagnant (à adapter selon la structure réelle des matches) */}
            {/*
            <List>
              {tournament.matches && tournament.matches.map((match) => (
                <ListItem key={match.id}>
                  <ListItemText
                    primary={`Match ${match.round}: ${match.player1_id} vs ${match.player2_id}`}
                    secondary={`Score: ${match.score1} - ${match.score2}`}
                  />
                  <Button size="small" variant="outlined">Déclarer gagnant</Button>
                </ListItem>
              ))}
            </List>
            */}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TournamentDetails; 