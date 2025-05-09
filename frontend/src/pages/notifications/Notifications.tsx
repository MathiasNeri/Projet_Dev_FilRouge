import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  EmojiEvents as TournamentIcon,
  SportsEsports as MatchIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Notification {
  id: number;
  type: 'tournament' | 'match';
  message: string;
  created_at: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/notifications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'tournament':
        return <TournamentIcon />;
      case 'match':
        return <MatchIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        
        <List>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read ? 'inherit' : 'action.hover'
                }}
              >
                <ListItemIcon>
                  {getIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="textSecondary">
                        {new Date(notification.created_at).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default Notifications; 