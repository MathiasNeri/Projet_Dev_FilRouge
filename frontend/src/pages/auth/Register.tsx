import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(err.response.data.message || "L'inscription a échoué. Veuillez réessayer.");
        } else if (err.request) {
          setError("Pas de réponse du serveur. Veuillez vérifier que le serveur fonctionne.");
        } else {
          setError("Erreur lors de la requête. Veuillez réessayer.");
        }
      } else {
        setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #181926 0%, #232946 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 2, sm: 6 },
      px: { xs: 1, sm: 0 },
    }}>
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={8} sx={{
          p: { xs: 2, sm: 4 },
          mt: { xs: 2, sm: 8 },
          background: 'rgba(35,41,70,0.97)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          width: '100%',
          maxWidth: 500,
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: 24, sm: 32 } }}>
            Inscription
          </Typography>
          {error && (
            <Typography color="error" align="center" gutterBottom sx={{ color: '#e57373', fontSize: { xs: 14, sm: 16 } }}>
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputLabelProps={{ style: { color: '#b8c1ec', fontSize: 15 } }}
              InputProps={{ style: { color: '#fff', fontSize: 16 } }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputLabelProps={{ style: { color: '#b8c1ec', fontSize: 15 } }}
              InputProps={{ style: { color: '#fff', fontSize: 16 } }}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputLabelProps={{ style: { color: '#b8c1ec', fontSize: 15 } }}
              InputProps={{ style: { color: '#fff', fontSize: 16 } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, background: 'linear-gradient(90deg, #3a86ff 60%, #43a047 100%)', color: '#fff', fontWeight: 700, borderRadius: 3, boxShadow: '0 2px 8px rgba(58,134,255,0.10)', fontSize: { xs: 16, sm: 18 }, '&:hover': { background: 'linear-gradient(90deg, #265d97 60%, #388e3c 100%)' } }}
              disabled={loading}
            >
              {loading ? 'Inscription en cours...' : "S'inscrire"}
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" sx={{ color: '#b8c1ec', fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}>
              Déjà un compte ? Connectez-vous ici
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 