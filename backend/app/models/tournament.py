from app import db
from datetime import datetime

class Tournament(db.Model):
    __tablename__ = 'tournament'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    game_type = db.Column(db.String(64), nullable=False)
    format = db.Column(db.String(64), nullable=False)
    status = db.Column(db.String(32), default='pending')  # pending, active, completed
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    max_participants = db.Column(db.Integer)
    
    participants = db.relationship('TournamentParticipant', backref='tournament', lazy='dynamic', cascade="all, delete-orphan")
    matches = db.relationship('Match', backref='tournament', lazy='dynamic')

class TournamentParticipant(db.Model):
    __tablename__ = 'tournament_participant'
    
    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournament.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(32), default='pending')  # pending, accepted, rejected, active, eliminated, winner
    
    __table_args__ = (
        db.UniqueConstraint('tournament_id', 'user_id', name='unique_tournament_participant'),
    )

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournament.id'), nullable=False)
    round = db.Column(db.Integer, nullable=False)
    player1_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    player2_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    score1 = db.Column(db.Integer)
    score2 = db.Column(db.Integer)
    winner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed
    scheduled_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 