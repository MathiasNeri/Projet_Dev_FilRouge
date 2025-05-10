import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

interface Participant {
  id: string;
  name: string;
}

interface Match {
  id: string;
  round: number;
  matchIndex: number;
  teamA: Participant | null;
  teamB: Participant | null;
  winner: 'A' | 'B' | null;
  isLoserBracket?: boolean;
  nextMatchId?: string;
  nextMatchIsLoser?: boolean;
  loserNextMatchId?: string;
}

const ViewBracket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [bracketRounds, setBracketRounds] = useState<Match[][]>([]);
  const [loserBracketRounds, setLoserBracketRounds] = useState<Match[][]>([]);
  const [tournamentFormat, setTournamentFormat] = useState<string>('single_elimination');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tourRes = await axios.get(`/tournaments/${id}`);
        const mapped = tourRes.data.participants
          .filter((p: any) => p.status === 'accepted')
          .map((p: any) => ({
            id: String(p.user_id || p.id),
            name: p.username || p.guest_name || p.email || `User ${p.user_id || p.id}`
          }));
        setParticipants(mapped);
        setTournamentFormat(tourRes.data.format);

        const bracketRes = await axios.get(`/tournaments/${id}/bracket`);
        
        if (tourRes.data.format === 'double_elimination') {
          if (bracketRes.data.bracket && 
              typeof bracketRes.data.bracket === 'object' && 
              'main' in bracketRes.data.bracket && 
              'loser' in bracketRes.data.bracket) {
            setBracketRounds(bracketRes.data.bracket.main || []);
            setLoserBracketRounds(bracketRes.data.bracket.loser || []);
          } else {
            setBracketRounds([]);
            setLoserBracketRounds([]);
          }
        } else {
          if (Array.isArray(bracketRes.data.bracket) && bracketRes.data.bracket.length > 0) {
            setBracketRounds(bracketRes.data.bracket);
          } else {
            setBracketRounds([]);
          }
        }
      } catch (e) {
        setError('Erreur lors du chargement du bracket.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Rafraîchissement automatique toutes les 3 secondes
    const interval = setInterval(() => {
      fetchData();
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const renderMatch = (match: Match, isFinal: boolean = false, isLoserBracket: boolean = false) => {
    let winnerIdx: 'A' | 'B' | null = null;
    if (match.winner === 'A') winnerIdx = 'A';
    if (match.winner === 'B') winnerIdx = 'B';

    return (
      <Box key={match.id} sx={{
        minWidth: { xs: 120, sm: 160, md: 180 },
        maxWidth: { xs: 160, sm: 200, md: 220 },
        minHeight: { xs: 48, sm: 60, md: 70 },
        background: isFinal && winnerIdx && !isLoserBracket ? '#1e2a3a' : '#232946',
        border: isFinal && winnerIdx && !isLoserBracket ? '3px solid #43a047' : '2px solid #3a86ff',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(80,120,200,0.07)',
        p: { xs: 0.5, sm: 1, md: 1.5 },
        mb: { xs: 1, sm: 2, md: 3 },
        transition: 'background 0.2s, border 0.2s',
        '&:hover': {
          background: '#232946',
          borderColor: '#43a047',
        },
      }}>
        <Box sx={{
          width: '100%',
          p: { xs: 0.5, sm: 1 },
          mb: 1,
          borderRadius: 2,
          background: match.winner === 'A' ? '#43a047' : '#232946',
          border: match.winner === 'A' ? '2px solid #43a047' : '1.5px solid #3a86ff',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: { xs: 13, sm: 16 },
          color: '#fff',
          transition: 'background 0.2s, border 0.2s',
        }}>
          {match.teamA ? match.teamA.name : <span style={{ color: '#bbb' }}>---</span>}
        </Box>
        <Box sx={{
          width: '100%',
          p: { xs: 0.5, sm: 1 },
          borderRadius: 2,
          background: match.winner === 'B' ? '#43a047' : '#232946',
          border: match.winner === 'B' ? '2px solid #43a047' : '1.5px solid #3a86ff',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: { xs: 13, sm: 16 },
          color: '#fff',
          transition: 'background 0.2s, border 0.2s',
        }}>
          {match.teamB ? match.teamB.name : <span style={{ color: '#bbb' }}>---</span>}
        </Box>
        {isFinal && winnerIdx && !isLoserBracket && (
          <Typography sx={{ mt: 1, color: '#43a047', fontWeight: 700, fontSize: { xs: 15, sm: 18 } }}>
            🏆 Vainqueur !
          </Typography>
        )}
      </Box>
    );
  };

  const renderBracket = (rounds: Match[][], title: string, isLoserBracket: boolean = false) => (
    <Paper elevation={6} sx={{
      p: { xs: 1, sm: 2, md: 4 },
      borderRadius: 4,
      background: 'rgba(35,41,70,0.97)',
      mt: { xs: 1, sm: 2, md: 4 },
      width: '100%',
      maxWidth: { xs: '100vw', sm: 700, md: 1200 },
      mx: 'auto',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
      overflowX: 'auto',
    }}>
      <Typography variant="h6" gutterBottom sx={{ mb: { xs: 2, sm: 3 }, color: '#b8c1ec', fontWeight: 700, fontSize: { xs: 16, sm: 20 } }}>
        {title}
      </Typography>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: { xs: 2, sm: 4, md: 6 },
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        pb: { xs: 1, sm: 2 },
      }}>
        {rounds.map((round, roundIdx) => (
          <Box key={roundIdx} sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 3, md: 4 },
            alignItems: 'center',
            minWidth: { xs: 120, sm: 160, md: 180 },
            maxWidth: { xs: 160, sm: 200, md: 220 },
            width: '100%',
          }}>
            <Typography variant="subtitle2" align="center" sx={{ mb: 1, color: '#43a047', fontWeight: 700, letterSpacing: 1, fontSize: { xs: 13, sm: 15, md: 17 } }}>
              Round {roundIdx + 1}
            </Typography>
            {round.map((match) => renderMatch(match, roundIdx === rounds.length - 1, isLoserBracket))}
          </Box>
        ))}
      </Box>
    </Paper>
  );

  if (loading) return <Container><Typography>Chargement...</Typography></Container>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #181926 0%, #232946 100%)',
      paddingTop: { xs: 2, sm: 4, md: 6 },
      paddingBottom: { xs: 2, sm: 4, md: 6 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100vw',
      overflowX: 'hidden',
    }}>
      <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', px: { xs: 0, sm: 2, md: 0 } }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: 24, sm: 32 } }}>
          Bracket du tournoi {tournamentFormat === 'double_elimination' ? '(Double Élimination)' : ''}
        </Typography>
        
        {bracketRounds.length > 0 && (
          <>
            {renderBracket(bracketRounds, 'Bracket Principal', false)}
            {tournamentFormat === 'double_elimination' && loserBracketRounds.length > 0 && (
              renderBracket(loserBracketRounds, 'Bracket des Perdants', true)
            )}
          </>
        )}
        
        {bracketRounds.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ mt: 4, color: '#b8c1ec' }}>
            Aucun bracket n'a encore été généré.
          </Typography>
        )}
        
        <Button
          variant="outlined"
          sx={{
            mt: 4,
            ml: 0,
            borderRadius: 2,
            color: '#b8c1ec',
            borderColor: '#3a86ff',
            fontWeight: 700,
            fontSize: { xs: 13, sm: 16 },
            '&:hover': { background: '#232946', borderColor: '#3a86ff' }
          }}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Container>
    </Box>
  );
};

export default ViewBracket; 