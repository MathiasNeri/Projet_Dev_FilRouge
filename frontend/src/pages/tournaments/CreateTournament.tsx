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
    start_date: '',
    end_date: '',
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
      // Conversion des dates au format ISO 8601
      const payload = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : '',
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : '',
        format: formData.format.toLowerCase().replace(' ', '_'),
        max_participants: Number(formData.max_participants),
      };
      console.log('Payload envoyé:', payload); // DEBUG
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
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Tournament
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tournament Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Game Type"
                name="game_type"
                value={formData.game_type}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Participants"
                name="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={handleChange}
                required
                inputProps={{ min: 2, max: 128 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Tournament Format"
                name="format"
                value={formData.format}
                onChange={handleChange}
                required
              >
                <MenuItem value="single_elimination">Single Elimination</MenuItem>
                <MenuItem value="double_elimination">Double Elimination</MenuItem>
                <MenuItem value="round_robin">Round Robin</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tournaments')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Create Tournament
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateTournament; 