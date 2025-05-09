import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';

// Layout
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TournamentList from './pages/tournaments/TournamentList';
import TournamentDetails from './pages/tournaments/TournamentDetails';
import CreateTournament from './pages/tournaments/CreateTournament';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />
            <Route
              path="/create-tournament"
              element={
                <PrivateRoute>
                  <CreateTournament />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 