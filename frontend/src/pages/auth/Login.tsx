import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Email ou mot de passe invalide');
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
            Connexion
          </Typography>
          {error && (
            <Typography color="error" align="center" gutterBottom sx={{ color: '#e57373', fontSize: { xs: 14, sm: 16 } }}>
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
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
            >
              Se connecter
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" sx={{ color: '#b8c1ec', fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}>
              Pas de compte ? Inscrivez-vous ici
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 