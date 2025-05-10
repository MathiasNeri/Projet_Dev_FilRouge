import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
} from '@mui/material';
import axios from 'axios';

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    game_type: '',
    max_participants: 16,
    format: 'single_elimination',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        format: formData.format.toLowerCase().replace(' ', '_'),
        max_participants: Number(formData.max_participants),
      };
      await axios.post(
        'http://localhost:5000/tournaments',
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate('/tournaments');
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #181926 0%, #232946 100%)',
      py: 6,
    }}>
      <Container maxWidth="sm">
        <Paper elevation={12} sx={{
          p: 5,
          background: '#f3f4f8',
          borderRadius: 6,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#1a237e', fontWeight: 900, mb: 3, letterSpacing: 1 }}>
            Créer un Tournoi
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Nom du Tournoi"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{
                  background: '#f3f4f8',
                  color: '#222',
                  borderRadius: 3,
                  border: '1.5px solid #3a86ff',
                  fontSize: 17,
                  mb: 1,
                }}
                InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
                InputProps={{ style: { background: '#f3f4f8' } }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                sx={{
                  background: '#f3f4f8',
                  color: '#222',
                  borderRadius: 3,
                  border: '1.5px solid #3a86ff',
                  fontSize: 17,
                  mb: 1,
                }}
                InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
                InputProps={{ style: { background: '#f3f4f8' } }}
              />
              <TextField
                fullWidth
                label="Type de Jeu"
                name="game_type"
                value={formData.game_type}
                onChange={handleChange}
                required
                sx={{
                  background: '#f3f4f8',
                  color: '#222',
                  borderRadius: 3,
                  border: '1.5px solid #3a86ff',
                  fontSize: 17,
                  mb: 1,
                }}
                InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
                InputProps={{ style: { background: '#f3f4f8' } }}
              />
              <TextField
                select
                fullWidth
                label="Nombre de Participants"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                required
                sx={{
                  background: '#f3f4f8',
                  color: '#222',
                  borderRadius: 3,
                  border: '1.5px solid #3a86ff',
                  fontSize: 17,
                  mb: 1,
                }}
                InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
                InputProps={{ style: { background: '#f3f4f8' } }}
                helperText="Seules les puissances de 2 sont autorisées pour garantir un bracket équilibré."
              >
                {[2, 4, 8, 16, 32, 64].map((val) => (
                  <MenuItem key={val} value={val}>{val} participants</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Tournament Format"
                name="format"
                value={formData.format}
                onChange={handleChange}
                required
                sx={{
                  background: '#f3f4f8',
                  color: '#222',
                  borderRadius: 3,
                  border: '1.5px solid #3a86ff',
                  fontSize: 17,
                  mb: 2,
                }}
                InputLabelProps={{ style: { color: '#1a237e', fontWeight: 600 } }}
                InputProps={{ style: { background: '#f3f4f8' } }}
              >
                <MenuItem value="single_elimination">Single Elimination</MenuItem>
                <MenuItem value="double_elimination">Double Elimination</MenuItem>
              </TextField>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 4,
                    px: 5,
                    py: 1.7,
                    fontWeight: 800,
                    fontSize: 20,
                    background: 'linear-gradient(90deg, #3a86ff 60%, #43a047 100%)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(58,134,255,0.13)',
                    letterSpacing: 1,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #265d97 60%, #388e3c 100%)',
                    },
                  }}
                >
                  Créer
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateTournament; 