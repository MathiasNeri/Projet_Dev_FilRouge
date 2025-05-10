from app import db
from app.models.notification import Notification

class NotificationService:
    @staticmethod
    def create_notification(user_id, title, message, type):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type
        )
        db.session.add(notification)
        db.session.commit()
        return notification

    @staticmethod
    def notify_tournament_start(tournament):
        participants = tournament.participants.all()
        for participant in participants:
            NotificationService.create_notification(
                participant.user_id,
                f"Tournoi {tournament.name}",
                "Le tournoi commence maintenant !",
                "tournament_start"
            )

    @staticmethod
    def notify_match_scheduled(match):
        for player_id in [match.player1_id, match.player2_id]:
            if player_id:
                NotificationService.create_notification(
                    player_id,
                    "Match Programmé",
                    f"Votre prochain match est programmé.",
                    "match_scheduled"
                ) 