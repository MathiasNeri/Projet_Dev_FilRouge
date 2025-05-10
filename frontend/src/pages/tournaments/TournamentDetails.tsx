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
  max_participants: number;
  participants: Array<{
    id: number;
    username?: string;
    user_id?: number;
    status: string;
    email?: string;
    guest_name?: string;
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
  const [addGuestName, setAddGuestName] = useState('');
  const [joinRequestStatus, setJoinRequestStatus] = useState<string | null>(null);
  const [bracketValidated, setBracketValidated] = useState(false);
  const [tournamentStatus, setTournamentStatus] = useState<string>('pending');

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
        setTournament(response.data);
        setEditData(response.data);
        setTournamentStatus(response.data.status || 'pending');
        if (response.data.bracket && ((Array.isArray(response.data.bracket) && response.data.bracket.length > 0) || (typeof response.data.bracket === 'object' && response.data.bracket.main && response.data.bracket.main.length > 0))) {
          setBracketValidated(true);
        } else {
          setBracketValidated(false);
        }
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ?')) return;
    try {
      await axios.delete(`http://localhost:5000/tournaments/${id}`);
      navigate('/tournaments');
    } catch (error) {
      alert('Erreur lors de la suppression du tournoi');
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/tournaments/${id}`, editData);
      setEditMode(false);
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      alert('Erreur lors de la mise à jour du tournoi');
    }
  };

  const handleAddParticipant = async () => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/add_participant`, { email: addUserEmail });
      setAddUserEmail('');
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      alert('Erreur lors de l\'ajout du participant');
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
      alert('Erreur lors de la sortie du tournoi');
    }
  };

  const handleKick = async (participantId: number) => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/kick`, { participant_id: participantId });
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      alert('Erreur lors de l\'expulsion du participant');
    }
  };

  const handleAddGuest = async () => {
    try {
      await axios.post(`http://localhost:5000/tournaments/${id}/add_participant`, { guest_name: addGuestName });
      setAddGuestName('');
      const response = await axios.get(`http://localhost:5000/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      alert('Erreur lors de l\'ajout de l\'invité');
    }
  };

  if (!tournament) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #181926 0%, #232946 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Container>
          <Typography sx={{ color: '#b8c1ec' }}>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  const isCreator = user && Number(user.id) === Number(tournament.creator_id);

  // Vérifie si l'utilisateur courant est un participant accepté (avec ou sans compte)
  const isAcceptedParticipant = tournament.participants.some(
    (p) =>
      (user && String(p.user_id) === String(user.id) && p.status === 'accepted') ||
      (!user && p.status === 'accepted' && p.guest_name)
  );

  // Vérifie si l'utilisateur courant a une demande en attente
  const isPendingParticipant = tournament.participants.some(
    (p) => user && String(p.user_id) === String(user.id) && p.status === 'pending'
  );

  // Vérifie si l'utilisateur courant a été refusé
  const isRejectedParticipant = tournament.participants.some(
    (p) => user && String(p.user_id) === String(user.id) && p.status === 'rejected'
  );

  // Calcul du nombre de participants acceptés
  const acceptedCount = tournament.participants.filter(p => p.status === 'accepted').length;
  const isFull = acceptedCount >= Number(tournament.max_participants);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #181926 0%, #232946 100%)',
      py: 6,
    }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={8} sx={{
          p: 4,
          background: 'rgba(35,41,70,0.97)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#fff', fontWeight: 800 }}>
            {tournament.name}
          </Typography>
          {/* Badge Complet/Incomplet */}
          <Box sx={{ mb: 2 }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 18px',
              borderRadius: 16,
              background: isFull ? '#43a047' : '#ff9800',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              marginRight: 12,
            }}>
              {isFull ? 'Complet' : 'Incomplet'} ({acceptedCount}/{tournament.max_participants} inscrits)
            </span>
          </Box>
          {isCreator && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button variant="outlined" color="primary" onClick={() => setEditMode((v) => !v)}
                sx={{ borderRadius: 3, color: '#b8c1ec', borderColor: '#3a86ff', fontWeight: 700, '&:hover': { background: '#232946', borderColor: '#3a86ff' } }}
                disabled={bracketValidated || tournamentStatus === 'completed'}
              >
                {editMode ? 'Cancel Edit' : 'Edit'}
              </Button>
              <Button variant="outlined" color="error" onClick={handleDelete}
                sx={{ borderRadius: 3, fontWeight: 700 }}>
                Delete
              </Button>
              <Button variant="contained" color="secondary" onClick={() => navigate(`/tournaments/${id}/manage-bracket`)}
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
                disabled={tournamentStatus === 'completed'}
              >
                Gérer le bracket
              </Button>
              {(bracketValidated || tournamentStatus === 'completed') && (
                <Typography sx={{ color: '#ff9800', fontWeight: 600, ml: 2 }}>
                  {tournamentStatus === 'completed'
                    ? "Le tournoi est terminé. Plus aucune modification n'est possible."
                    : "Les paramètres du tournoi ne sont plus modifiables après validation des placements.\nRéinitialisez le bracket pour rééditer."}
                </Typography>
              )}
            </Box>
          )}
          {/* Bouton voir le bracket toujours visible */}
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="secondary" onClick={() => navigate(`/tournaments/${id}/view-bracket`)}
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
              }}>
              Voir le bracket
            </Button>
          </Box>
          {editMode ? (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Name"
                    style={{ padding: 8, borderRadius: 4, border: '1px solid #3a86ff', background: '#232946', color: '#fff', width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <input
                    type="text"
                    value={editData.game_type}
                    onChange={e => setEditData({ ...editData, game_type: e.target.value })}
                    placeholder="Game Type"
                    style={{ padding: 8, borderRadius: 4, border: '1px solid #3a86ff', background: '#232946', color: '#fff', width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <textarea
                    value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Description"
                    style={{ padding: 8, borderRadius: 4, border: '1px solid #3a86ff', background: '#232946', color: '#fff', width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* Menu déroulant pour max_participants, valeurs >= nombre d'inscrits */}
                  <select
                    value={editData.max_participants}
                    onChange={e => setEditData({ ...editData, max_participants: Number(e.target.value) })}
                    style={{ padding: 8, borderRadius: 4, border: '1px solid #3a86ff', background: '#f3f4f8', color: '#222', width: '100%', fontWeight: 600 }}
                  >
                    {([2, 4, 8, 16, 32, 64] as number[]).filter(val => val >= tournament.participants.length).map(val => (
                      <option key={val} value={val}>{val} participants</option>
                    ))}
                  </select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <input
                    type="text"
                    value={editData.format}
                    onChange={e => setEditData({ ...editData, format: e.target.value })}
                    placeholder="Format"
                    style={{ padding: 8, borderRadius: 4, border: '1px solid #3a86ff', background: '#232946', color: '#fff', width: '100%' }}
                  />
                </Grid>
              </Grid>
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleEdit}>
                Enregistrer
              </Button>
            </Box>
          ) : null}
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom sx={{ color: '#b8c1ec', fontWeight: 700 }}>
                Détails
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#e0e0e0' }}>
                {tournament.description}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b8c1ec' }}>
                Type de Jeu : {tournament.game_type}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b8c1ec' }}>
                Format : {tournament.format}
              </Typography>
              <Typography variant="body2" sx={{ color: '#43a047', fontWeight: 600 }}>
                Statut : {tournament.status}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ color: '#b8c1ec', fontWeight: 700 }}>
                Participants
              </Typography>
              <List sx={{ background: 'rgba(40,44,70,0.95)', borderRadius: 2, boxShadow: 1 }}>
                {(
                  tournament.participants
                    .filter(participant => participant.status === 'accepted' || participant.status === 'pending')
                    .map((participant) => (
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
                          sx={{ bgcolor: participant.status === 'pending' ? '#2d3a4b' : 'rgba(35,41,70,0.97)', borderRadius: 1, mb: 1 }}
                        >
                          <ListItemText
                            primary={<span style={{ color: '#fff' }}>{participant.username || participant.guest_name || participant.email || participant.user_id}</span>}
                            secondary={<span style={{ color: '#b8c1ec' }}>{participant.status === 'pending' ? 'En attente' : 'Accepté'}</span>}
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
                        <Divider sx={{ bgcolor: '#232946' }} />
                      </React.Fragment>
                    ))
                )}
              </List>
              {isCreator && (
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <input
                      type="email"
                      placeholder="Email à ajouter"
                      value={addUserEmail}
                      onChange={e => setAddUserEmail(e.target.value)}
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #3a86ff', background: '#232946', color: '#fff', marginRight: 8 }}
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleAddParticipant}
                      disabled={!addUserEmail && !addGuestName}
                      sx={{
                        background: 'linear-gradient(90deg, #43a047 60%, #3a86ff 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 3,
                        px: 3,
                        py: 1.2,
                        boxShadow: '0 2px 8px rgba(58,134,255,0.10)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #388e3c 60%, #265d97 100%)',
                        },
                      }}
                    >
                      Ajouter par email
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <input
                      type="text"
                      placeholder="Nom de l'invité à ajouter"
                      value={addGuestName}
                      onChange={e => setAddGuestName(e.target.value)}
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #3a86ff', background: '#232946', color: '#fff', marginRight: 8 }}
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleAddGuest}
                      disabled={!addGuestName}
                      sx={{
                        background: 'linear-gradient(90deg, #43a047 60%, #3a86ff 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 3,
                        px: 3,
                        py: 1.2,
                        boxShadow: '0 2px 8px rgba(58,134,255,0.10)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #388e3c 60%, #265d97 100%)',
                        },
                      }}
                    >
                      Ajouter invité
                    </Button>
                  </Box>
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
                    disabled={joinRequestStatus === 'pending' || isFull || isAcceptedParticipant || isPendingParticipant}
                    sx={{ background: 'linear-gradient(90deg, #3a86ff 60%, #43a047 100%)', color: '#fff' }}
                  >
                    {isFull ? 'Tournoi complet' : (isAcceptedParticipant ? 'Déjà inscrit' : (isPendingParticipant ? 'Request Sent' : 'Request to Join'))}
                  </Button>
                  {joinRequestStatus && joinRequestStatus !== 'pending' && (
                    <Typography color="error" variant="body2">{joinRequestStatus}</Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default TournamentDetails; 