import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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

const getBracketSize = (n: number) => {
  // Arrondit au prochain nombre pair de puissance de 2
  return Math.pow(2, Math.ceil(Math.log2(n)));
};

const TournamentBracketManager: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [placement, setPlacement] = useState<(string | null)[]>([]); // ids des participants
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bracketRounds, setBracketRounds] = useState<Match[][]>([]);
  const [loserBracketRounds, setLoserBracketRounds] = useState<Match[][]>([]);
  const [tournamentFormat, setTournamentFormat] = useState<string>('single_elimination');
  const [bracketLoaded, setBracketLoaded] = useState(false);
  const [tournamentStatus, setTournamentStatus] = useState<string>('pending');
  const [tournamentMaxParticipants, setTournamentMaxParticipants] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/tournaments/${id}`);
        const mapped = res.data.participants.map((p: any) => ({
          id: String(p.user_id || p.id),
          name: p.username || p.guest_name || p.email || `User ${p.user_id || p.id}`,
        }));
        setParticipants(mapped);
        setTournamentFormat(res.data.format);
        setTournamentStatus(res.data.status);
        setTournamentMaxParticipants(res.data.max_participants || 0);
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        setIsCreator(user && String(user.id) === String(res.data.creator_id));
        // Charge le bracket existant
        const bracketRes = await axios.get(`/tournaments/${id}/bracket`);
        
        if (res.data.format === 'double_elimination') {
          if (
            bracketRes.data.bracket &&
            typeof bracketRes.data.bracket === 'object' &&
            'main' in bracketRes.data.bracket &&
            'loser' in bracketRes.data.bracket &&
            Array.isArray(bracketRes.data.bracket.main) &&
            bracketRes.data.bracket.main.length > 0 &&
            Array.isArray(bracketRes.data.bracket.main[0]) &&
            bracketRes.data.bracket.main[0].length > 0 &&
            (
              bracketRes.data.bracket.main[0][0]?.teamA ||
              bracketRes.data.bracket.main[0][0]?.teamB
            )
          ) {
            setBracketRounds(bracketRes.data.bracket.main);
            setLoserBracketRounds(bracketRes.data.bracket.loser || []);
            setValidated(true);
          } else {
            const size = getBracketSize(mapped.length);
            setPlacement(Array(size).fill(null));
            setBracketRounds([]);
            setLoserBracketRounds([]);
            setValidated(false);
          }
        } else {
          if (
            Array.isArray(bracketRes.data.bracket) &&
            bracketRes.data.bracket.length > 0 &&
            Array.isArray(bracketRes.data.bracket[0]) &&
            bracketRes.data.bracket[0].length > 0 &&
            (
              bracketRes.data.bracket[0][0]?.teamA ||
              bracketRes.data.bracket[0][0]?.teamB
            )
          ) {
            setBracketRounds(bracketRes.data.bracket);
            setValidated(true);
          } else {
            const size = getBracketSize(mapped.length);
            setPlacement(Array(size).fill(null));
            setBracketRounds([]);
            setLoserBracketRounds([]);
            setValidated(false);
          }
        }
        setBracketLoaded(true);
      } catch (e: any) {
        setError('Erreur lors du chargement du tournoi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // S'assure que le placement est toujours initialisé à la bonne taille
  useEffect(() => {
    if (!validated && participants.length > 0 && (placement.length === 0 || placement.length !== getBracketSize(participants.length))) {
      const size = getBracketSize(participants.length);
      setPlacement(Array(size).fill(null));
    }
  }, [validated, participants, placement.length]);

  // Quand on valide le placement, on génère le bracket
  const handleValidate = () => {
    setValidated(true);
    setSuccessMsg('Placement validé !');
    setErrorMsg(null);
    if (tournamentFormat === 'double_elimination') {
      const { mainBracket, loserBracket } = generateDoubleEliminationBracket(placement, participants);
      setBracketRounds(mainBracket);
      setLoserBracketRounds(loserBracket);
      // Sauvegarde immédiate du bracket généré
      if (isCreator) {
        axios.post(`/tournaments/${id}/bracket`, {
          bracket: {
            main: mainBracket,
            loser: loserBracket
          }
        }).catch(err => {
          setErrorMsg('Erreur lors de la sauvegarde du bracket');
        });
      }
    } else {
      const generated = generateSingleEliminationBracket(placement, participants);
      setBracketRounds(generated);
      // Sauvegarde immédiate du bracket généré
      if (isCreator) {
        axios.post(`/tournaments/${id}/bracket`, { bracket: generated })
          .catch(err => {
            setErrorMsg('Erreur lors de la sauvegarde du bracket');
          });
      }
    }
  };

  // Sauvegarde le bracket à chaque modification si créateur
  useEffect(() => {
    if (
      isCreator &&
      validated &&
      bracketRounds.length > 0
    ) {
      if (tournamentFormat === 'double_elimination') {
        axios.post(`/tournaments/${id}/bracket`, {
          bracket: {
            main: bracketRounds,
            loser: loserBracketRounds
          }
        })
        .catch(err => {
          setErrorMsg(JSON.stringify(err.response?.data || err.message));
          alert('Erreur backend: ' + JSON.stringify(err.response?.data || err.message));
        });
      } else {
        axios.post(`/tournaments/${id}/bracket`, { bracket: bracketRounds })
        .catch(err => {
          setErrorMsg(JSON.stringify(err.response?.data || err.message));
          alert('Erreur backend: ' + JSON.stringify(err.response?.data || err.message));
        });
      }
    }
  }, [isCreator, validated, bracketRounds, loserBracketRounds, id, tournamentFormat]);

  const handleSelect = (idx: number, value: string) => {
    setPlacement(prev => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  // Génère la structure du bracket à partir du placement validé
  function generateBracket(placement: (string | null)[], participants: Participant[]) {
    const n = placement.length;
    const size = n;
    const rounds: any[][] = [];
    // Premier tour
    const firstRound: any[] = [];
    for (let i = 0; i < size / 2; i++) {
      const teamA = participants.find(p => p.id === placement[i * 2]) || null;
      const teamB = participants.find(p => p.id === placement[i * 2 + 1]) || null;
      firstRound.push({
        id: `match-1-${i}`,
        round: 1,
        matchIndex: i,
        teamA,
        teamB,
        winner: null,
      });
    }
    rounds.push(firstRound);
    // Rounds suivants (structure vide)
    let prevRound = firstRound;
    let roundNum = 2;
    while (prevRound.length > 1) {
      const thisRound: any[] = [];
      for (let i = 0; i < prevRound.length / 2; i++) {
        thisRound.push({
          id: `match-${roundNum}-${i}`,
          round: roundNum,
          matchIndex: i,
          teamA: null,
          teamB: null,
          winner: null,
        });
      }
      rounds.push(thisRound);
      prevRound = thisRound;
      roundNum++;
    }
    return rounds;
  }

  // Fonction pour faire avancer le gagnant
  const handleWinner = (roundIdx: number, matchIdx: number, winner: 'A' | 'B', isLoserBracket: boolean = false) => {
    const rounds = isLoserBracket ? loserBracketRounds : bracketRounds;
    const setRounds = isLoserBracket ? setLoserBracketRounds : setBracketRounds;
    
    // Créer une copie profonde des rounds
    const newRounds = rounds.map(round => round.map(match => ({ ...match })));
    const match = newRounds[roundIdx][matchIdx];
    match.winner = winner;

    // Mise à jour du match suivant (pour le gagnant)
    if (match.nextMatchId) {
      const nextRoundIdx = roundIdx + 1;
      if (nextRoundIdx < newRounds.length) {
        const nextMatch = newRounds[nextRoundIdx].find(m => m.id === match.nextMatchId);
        if (nextMatch) {
          const winnerTeam = winner === 'A' ? match.teamA : match.teamB;
          if (matchIdx % 2 === 0) {
            nextMatch.teamA = winnerTeam;
          } else {
            nextMatch.teamB = winnerTeam;
          }
        }
      }
    }

    // Si c'est un match du winner bracket et que c'est une défaite, envoyer le perdant dans le bon match du loser bracket
    if (!isLoserBracket && tournamentFormat === 'double_elimination') {
      const loser = winner === 'A' ? match.teamB : match.teamA;
      if (loser && match.loserNextMatchId) {
        // Chercher le match du loser bracket correspondant
        let found = false;
        for (let r = 0; r < loserBracketRounds.length; r++) {
          for (let m = 0; m < loserBracketRounds[r].length; m++) {
            if (loserBracketRounds[r][m].id === match.loserNextMatchId) {
              if (match.id === 'wb-2-0') {
                // Cas spécial : le perdant du winner final va TOUJOURS en teamB de lb-2-0
                loserBracketRounds[r][m].teamB = loser;
                found = true;
                break;
              } else {
                // Cas général : placer dans le premier slot libre
                if (!loserBracketRounds[r][m].teamA) {
                  loserBracketRounds[r][m].teamA = loser;
                  found = true;
                  break;
                } else if (!loserBracketRounds[r][m].teamB) {
                  loserBracketRounds[r][m].teamB = loser;
                  found = true;
                  break;
                } else {
                  // Les deux slots sont pris, log d'erreur
                }
              }
            }
          }
          if (found) break;
        }
      }
    }

    // Après la gestion du winner et du loser bracket, alimenter la grande finale si besoin
    // Gagnant winner bracket (wb-2-0) => teamA de final-0
    // Gagnant loser bracket (lb-2-0) => teamB de final-0
    if (!isLoserBracket && match.id === 'wb-2-0' && match.winner) {
      // On est dans la finale du winner bracket
      const finalMatch = bracketRounds[2]?.find(m => m.id === 'final-0');
      if (finalMatch) {
        finalMatch.teamA = match.winner === 'A' ? match.teamA : match.teamB;
      }
    }
    if (isLoserBracket && match.id === 'lb-2-0' && match.winner) {
      // On est dans la finale du loser bracket
      const finalMatch = bracketRounds[2]?.find(m => m.id === 'final-0');
      if (finalMatch) {
        finalMatch.teamB = match.winner === 'A' ? match.teamA : match.teamB;
      }
    }

    setRounds(newRounds);

    // Sauvegarde immédiate côté backend
    if (isCreator) {
      if (tournamentFormat === 'double_elimination') {
        const main = isLoserBracket ? bracketRounds : newRounds;
        const loser = isLoserBracket ? newRounds : loserBracketRounds;
        axios.post(`/tournaments/${id}/bracket`, {
          bracket: {
            main: main,
            loser: loser
          }
        }).catch(err => {
          setErrorMsg('Erreur lors de la sauvegarde du bracket');
        });
      } else {
        axios.post(`/tournaments/${id}/bracket`, { 
          bracket: newRounds 
        }).catch(err => {
          setErrorMsg('Erreur lors de la sauvegarde du bracket');
        });
      }
    }
  };

  const findNextLoserMatch = (rounds: Match[][]): Match | null => {
    for (const round of rounds) {
      for (const match of round) {
        if (!match.teamA && !match.teamB) {
          return match;
        }
      }
    }
    return null;
  };

  const generateDoubleEliminationBracket = (placement: (string | null)[], participants: Participant[]) => {
    // Pour 4 équipes (extensible ensuite)
    // Winner bracket :
    //  - Round 1 : 2 matches (A vs B, C vs D)
    //  - Round 2 : 1 match (gagnant match 1 vs gagnant match 2)
    // Loser bracket :
    //  - Round 1 : 1 match (perdant match 1 vs perdant match 2)
    //  - Round 2 : 1 match (gagnant loser round 1 vs perdant winner final)
    // Finale : gagnant winner final vs gagnant loser final

    const mainBracket: Match[][] = [];
    const loserBracket: Match[][] = [];

    // WINNER BRACKET
    // Round 1
    const wb1: Match[] = [
      {
        id: 'wb-1-0', round: 1, matchIndex: 0,
        teamA: participants.find(p => p.id === placement[0]) || null,
        teamB: participants.find(p => p.id === placement[1]) || null,
        winner: null,
        nextMatchId: 'wb-2-0',
        loserNextMatchId: 'lb-1-0',
      },
      {
        id: 'wb-1-1', round: 1, matchIndex: 1,
        teamA: participants.find(p => p.id === placement[2]) || null,
        teamB: participants.find(p => p.id === placement[3]) || null,
        winner: null,
        nextMatchId: 'wb-2-0',
        loserNextMatchId: 'lb-1-0',
      },
    ];
    mainBracket.push(wb1);

    // Round 2 (finale winner bracket)
    const wb2: Match[] = [
      {
        id: 'wb-2-0', round: 2, matchIndex: 0,
        teamA: null, teamB: null, winner: null,
        nextMatchId: 'final-0',
        loserNextMatchId: 'lb-2-0',
      },
    ];
    mainBracket.push(wb2);

    // LOSER BRACKET
    // Round 1 : les deux perdants du winner bracket round 1
    const lb1: Match[] = [
      {
        id: 'lb-1-0', round: 1, matchIndex: 0,
        teamA: null, teamB: null, winner: null,
        nextMatchId: 'lb-2-0',
      },
    ];
    loserBracket.push(lb1);

    // Round 2 : gagnant loser round 1 vs perdant winner final
    const lb2: Match[] = [
      {
        id: 'lb-2-0', round: 2, matchIndex: 0,
        teamA: null, teamB: null, winner: null,
        nextMatchId: 'final-0',
      },
    ];
    loserBracket.push(lb2);

    // GRANDE FINALE
    // Gagnant winner final vs gagnant loser final
    const final: Match[] = [
      {
        id: 'final-0', round: 3, matchIndex: 0,
        teamA: null, teamB: null, winner: null,
      },
    ];
    mainBracket.push(final);

    return { mainBracket, loserBracket };
  };

  const generateSingleEliminationBracket = (placement: (string | null)[], participants: Participant[]) => {
    const n = placement.length;
    const size = n;
    const rounds: Match[][] = [];

    // Premier tour
    const firstRound: Match[] = [];
    for (let i = 0; i < size / 2; i++) {
      const teamA = participants.find(p => p.id === placement[i * 2]) || null;
      const teamB = participants.find(p => p.id === placement[i * 2 + 1]) || null;
      firstRound.push({
        id: `match-1-${i}`,
        round: 1,
        matchIndex: i,
        teamA,
        teamB,
        winner: null,
        nextMatchId: `match-2-${Math.floor(i / 2)}`,
      });
    }
    rounds.push(firstRound);

    // Rounds suivants
    let prevRound = firstRound;
    let roundNum = 2;
    while (prevRound.length > 1) {
      const thisRound: Match[] = [];
      for (let i = 0; i < prevRound.length / 2; i++) {
        thisRound.push({
          id: `match-${roundNum}-${i}`,
          round: roundNum,
          matchIndex: i,
          teamA: null,
          teamB: null,
          winner: null,
          nextMatchId: prevRound.length > 2 ? `match-${roundNum + 1}-${Math.floor(i / 2)}` : undefined,
        });
      }
      rounds.push(thisRound);
      prevRound = thisRound;
      roundNum++;
    }

    return rounds;
  };

  // Bouton pour réinitialiser le bracket (créateur uniquement)
  const handleResetBracket = async () => {
    if (!isCreator) return;
    const size = getBracketSize(participants.length);
    setPlacement(Array(size).fill(null));
    setBracketRounds([]);
    setLoserBracketRounds([]);
    setValidated(false);
    if (tournamentFormat === 'double_elimination') {
      await axios.post(`/tournaments/${id}/bracket`, { bracket: { main: [], loser: [] } });
    } else {
      await axios.post(`/tournaments/${id}/bracket`, { bracket: [] });
    }
    setSuccessMsg('Bracket réinitialisé.');
  };

  // Vérifie si tous les matches sont terminés (ont un winner) ET qu'il y a au moins un match
  const allMatchesCompleted = (
    bracketRounds.length > 0 &&
    bracketRounds.flat().length > 0 &&
    (
      tournamentFormat !== 'double_elimination'
        ? bracketRounds.flat().every(m => m.winner)
        : (() => {
            // Pour double élimination, seul le match final-0 compte
            const finalMatch = bracketRounds[2]?.find(m => m.id === 'final-0');
            return !!finalMatch && !!finalMatch.winner;
          })()
    )
  );

  // Bouton pour clôturer le tournoi (créateur uniquement, si pas déjà terminé)
  const handleCloseTournament = async () => {
    try {
      await axios.put(`/tournaments/${id}`, { status: 'completed' });
      setTournamentStatus('completed');
      setSuccessMsg('Tournoi clôturé !');
    } catch (e) {
      setErrorMsg('Erreur lors de la clôture du tournoi');
    }
  };

  // Calcul du nombre de participants acceptés
  const acceptedCount = participants.length;
  const isFull = acceptedCount >= tournamentMaxParticipants && tournamentMaxParticipants > 0;

  // Pour le style du background
  const backgroundStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #181926 0%, #232946 100%)',
    paddingTop: { xs: 2, sm: 4, md: 6 },
    paddingBottom: { xs: 2, sm: 4, md: 6 },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100vw',
    overflowX: 'hidden',
  };

  if (loading) return <Container><Typography>Chargement...</Typography></Container>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;
  if (!isCreator) return <Container><Typography color="error">Accès réservé au créateur du tournoi.</Typography></Container>;

  // Liste des participants non encore placés (pour éviter les doublons)
  const available = (idx: number) => participants.filter(p => !placement.includes(p.id) || placement[idx] === p.id);

  return (
    <Box sx={backgroundStyle}>
      <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', px: { xs: 0, sm: 2, md: 0 } }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: 24, sm: 32 } }}>
          Gestion du Bracket {tournamentFormat === 'double_elimination' ? '(Double Élimination)' : ''}
        </Typography>
        {/* Affiche le statut du tournoi */}
        <Typography sx={{ color: tournamentStatus === 'completed' ? '#43a047' : '#ff9800', fontWeight: 700, mb: 2 }}>
          Statut : {tournamentStatus === 'completed' ? 'Terminé' : 'En cours'}
        </Typography>
        {/* Blocage si tournoi pas complet */}
        {!isFull && (
          <Typography sx={{ color: '#ff9800', fontWeight: 700, mb: 3, fontSize: 18 }}>
            Le tournoi n'est pas complet ({acceptedCount}/{tournamentMaxParticipants} inscrits).<br />Vous ne pouvez gérer le bracket que lorsque tous les participants sont inscrits.
          </Typography>
        )}
        {isFull && (
          <Box>
            {/* Bouton clôture */}
            {isCreator && tournamentStatus !== 'completed' && allMatchesCompleted && (
              <Button
                variant="contained"
                color="error"
                sx={{ mb: 3, fontWeight: 700, fontSize: 16, borderRadius: 2, background: 'linear-gradient(90deg, #e57373 60%, #b71c1c 100%)', color: '#fff' }}
                onClick={handleCloseTournament}
              >
                Clôturer le tournoi
              </Button>
            )}
            {/* Affichage du placement tant que non validé */}
            {!validated && isCreator && (
              <Paper elevation={6} sx={{ p: { xs: 1, sm: 2, md: 4 }, borderRadius: 4, background: 'rgba(35,41,70,0.97)', mt: { xs: 1, sm: 2, md: 4 }, width: '100%', maxWidth: 600 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#b8c1ec', fontWeight: 700 }}>
                  Placer les équipes (premier tour)
                </Typography>
                {placement.map((val, idx) => (
                  <Box key={idx} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ minWidth: 40, color: '#43a047', fontWeight: 600 }}>Slot {idx + 1}</Typography>
                    <Select
                      value={val || ''}
                      onChange={e => handleSelect(idx, e.target.value as string)}
                      disabled={validated || !isCreator}
                      displayEmpty
                      sx={{ minWidth: 180, background: '#232946', borderRadius: 2, color: '#fff', border: '1px solid #3a86ff' }}
                      MenuProps={{ PaperProps: { sx: { background: '#232946', color: '#fff' } } }}
                    >
                      <MenuItem value=""><em>Choisir une équipe</em></MenuItem>
                      {available(idx).map(p => (
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleValidate}
                  disabled={validated || placement.some(v => !v) || !isCreator}
                  sx={{ mt: 2, fontWeight: 600, fontSize: 16, borderRadius: 2, background: 'linear-gradient(90deg, #3a86ff 60%, #43a047 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(58,134,255,0.10)', '&:hover': { background: 'linear-gradient(90deg, #265d97 60%, #388e3c 100%)' } }}
                >
                  Valider le placement
                </Button>
                {successMsg && <Typography sx={{ mt: 2, color: '#43a047' }}>{successMsg}</Typography>}
                {errorMsg && <Typography sx={{ mt: 2, color: '#e57373' }}>{errorMsg}</Typography>}
              </Paper>
            )}
            {/* Bracket affiché pour tous si existant */}
            {(Array.isArray(bracketRounds) && bracketRounds.length > 0) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', alignItems: 'center' }}>
                {/* Bracket principal */}
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
                    Bracket Principal
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
                    {bracketRounds.map((round, roundIdx) => (
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
                        {round.map((match, matchIdx) => (
                          <Box key={match.id} sx={{
                            minWidth: { xs: 120, sm: 160, md: 180 },
                            maxWidth: { xs: 160, sm: 200, md: 220 },
                            minHeight: { xs: 48, sm: 60, md: 70 },
                            background: '#232946',
                            border: '2px solid #3a86ff',
                            borderRadius: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 12px rgba(80,120,200,0.07)',
                            p: { xs: 0.5, sm: 1, md: 1.5 },
                            mb: { xs: 1, sm: 2, md: 3 },
                          }}>
                            <Button
                              fullWidth
                              variant={match.winner === 'A' ? 'contained' : 'outlined'}
                              color={match.winner === 'A' ? 'success' : match.winner === 'B' ? 'error' : 'primary'}
                              disabled={!isCreator || !match.teamA || !match.teamB || !!match.winner}
                              sx={{ mb: 1, borderRadius: 1, textTransform: 'none', fontWeight: 600, background: match.winner === 'A' ? '#43a047' : '#232946', color: '#fff !important', border: '1.5px solid #3a86ff', fontSize: { xs: 13, sm: 16 }, '&:hover': { background: '#388e3c' } }}
                              onClick={() => handleWinner(roundIdx, matchIdx, 'A')}
                            >
                              <span style={{ color: '#fff' }}>{match.teamA ? match.teamA.name : <span style={{ color: '#bbb' }}>---</span>}</span>
                            </Button>
                            <Button
                              fullWidth
                              variant={match.winner === 'B' ? 'contained' : 'outlined'}
                              color={match.winner === 'B' ? 'success' : match.winner === 'A' ? 'error' : 'primary'}
                              disabled={!isCreator || !match.teamA || !match.teamB || !!match.winner}
                              sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, background: match.winner === 'B' ? '#43a047' : '#232946', color: '#fff !important', border: '1.5px solid #3a86ff', fontSize: { xs: 13, sm: 16 }, '&:hover': { background: '#388e3c' } }}
                              onClick={() => handleWinner(roundIdx, matchIdx, 'B')}
                            >
                              <span style={{ color: '#fff' }}>{match.teamB ? match.teamB.name : <span style={{ color: '#bbb' }}>---</span>}</span>
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* Loser Bracket (si double élimination) */}
                {tournamentFormat === 'double_elimination' && loserBracketRounds.length > 0 && (
                  <Paper elevation={6} sx={{
                    p: { xs: 1, sm: 2, md: 4 },
                    borderRadius: 4,
                    background: 'rgba(35,41,70,0.97)',
                    width: '100%',
                    maxWidth: { xs: '100vw', sm: 700, md: 1200 },
                    mx: 'auto',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
                    overflowX: 'auto',
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: { xs: 2, sm: 3 }, color: '#b8c1ec', fontWeight: 700, fontSize: { xs: 16, sm: 20 } }}>
                      Bracket des Perdants
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
                      {loserBracketRounds.map((round, roundIdx) => (
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
                          {round.map((match, matchIdx) => (
                            <Box key={match.id} sx={{
                              minWidth: { xs: 120, sm: 160, md: 180 },
                              maxWidth: { xs: 160, sm: 200, md: 220 },
                              minHeight: { xs: 48, sm: 60, md: 70 },
                              background: '#232946',
                              border: '2px solid #3a86ff',
                              borderRadius: 4,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 12px rgba(80,120,200,0.07)',
                              p: { xs: 0.5, sm: 1, md: 1.5 },
                              mb: { xs: 1, sm: 2, md: 3 },
                            }}>
                              <Button
                                fullWidth
                                variant={match.winner === 'A' ? 'contained' : 'outlined'}
                                color={match.winner === 'A' ? 'success' : match.winner === 'B' ? 'error' : 'primary'}
                                disabled={!isCreator || !match.teamA || !match.teamB || !!match.winner}
                                sx={{ mb: 1, borderRadius: 1, textTransform: 'none', fontWeight: 600, background: match.winner === 'A' ? '#43a047' : '#232946', color: '#fff !important', border: '1.5px solid #3a86ff', fontSize: { xs: 13, sm: 16 }, '&:hover': { background: '#388e3c' } }}
                                onClick={() => handleWinner(roundIdx, matchIdx, 'A', true)}
                              >
                                <span style={{ color: '#fff' }}>{match.teamA ? match.teamA.name : <span style={{ color: '#bbb' }}>---</span>}</span>
                              </Button>
                              <Button
                                fullWidth
                                variant={match.winner === 'B' ? 'contained' : 'outlined'}
                                color={match.winner === 'B' ? 'success' : match.winner === 'A' ? 'error' : 'primary'}
                                disabled={!isCreator || !match.teamA || !match.teamB || !!match.winner}
                                sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, background: match.winner === 'B' ? '#43a047' : '#232946', color: '#fff !important', border: '1.5px solid #3a86ff', fontSize: { xs: 13, sm: 16 }, '&:hover': { background: '#388e3c' } }}
                                onClick={() => handleWinner(roundIdx, matchIdx, 'B', true)}
                              >
                                <span style={{ color: '#fff' }}>{match.teamB ? match.teamB.name : <span style={{ color: '#bbb' }}>---</span>}</span>
                              </Button>
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}

                {isCreator && (
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 2, borderRadius: 2, color: '#fff', borderColor: '#e57373', fontWeight: 700, fontSize: { xs: 13, sm: 16 }, '&:hover': { background: '#232946', borderColor: '#e57373' } }}
                    onClick={handleResetBracket}
                  >
                    Réinitialiser le bracket
                  </Button>
                )}
              </Box>
            )}
            {/* Désactive la gestion du bracket si terminé */}
            {tournamentStatus === 'completed' && (
              <Typography sx={{ color: '#43a047', fontWeight: 700, mt: 3, fontSize: 18 }}>
                Ce tournoi est terminé. Le bracket n'est plus modifiable.
              </Typography>
            )}
          </Box>
        )}
        <Button
          variant="outlined"
          sx={{ mt: 4, ml: 0, borderRadius: 2, color: '#b8c1ec', borderColor: '#3a86ff', fontWeight: 700, fontSize: { xs: 13, sm: 16 }, '&:hover': { background: '#232946', borderColor: '#3a86ff' } }}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Container>
    </Box>
  );
};

export default TournamentBracketManager; 