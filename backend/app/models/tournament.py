from app import db

class Tournament(db.Model):
    __tablename__ = 'tournament'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    game_type = db.Column(db.String(64), nullable=False)
    format = db.Column(db.String(64), nullable=False)
    status = db.Column(db.String(32), default='pending')
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    max_participants = db.Column(db.Integer)
    bracket = db.Column(db.JSON, nullable=True)
    participants = db.relationship('TournamentParticipant', backref='tournament', lazy='dynamic', cascade="all, delete-orphan")
    matches = db.relationship('Match', backref='tournament', lazy='dynamic')

class TournamentParticipant(db.Model):
    __tablename__ = 'tournament_participant'
    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey('tournament.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    guest_name = db.Column(db.String(128), nullable=True)
    status = db.Column(db.String(32), default='pending')
    __table_args__ = (
        db.UniqueConstraint('tournament_id', 'user_id', 'guest_name', name='unique_tournament_participant'),
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
    status = db.Column(db.String(20), default='pending') 