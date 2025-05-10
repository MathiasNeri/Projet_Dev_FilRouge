from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.tournament import Tournament, TournamentParticipant
from app.models.user import User

bp = Blueprint('tournaments', __name__)

@bp.route('/tournaments', methods=['GET'])
def get_tournaments():
    tournaments = Tournament.query.all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'description': t.description,
        'game_type': t.game_type,
        'format': t.format,
        'status': t.status,
        'creator_id': t.creator_id,
        'participant_count': t.participants.count()
    } for t in tournaments])

@bp.route('/tournaments', methods=['POST'])
@jwt_required()
def create_tournament():
    data = request.get_json()
    required_fields = ['name', 'description', 'game_type', 'max_participants', 'format']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400
    current_user_id = get_jwt_identity()
    try:
        tournament = Tournament(
            name=data['name'],
            description=data['description'],
            game_type=data['game_type'],
            max_participants=data['max_participants'],
            format=data['format'],
            creator_id=current_user_id
        )
        db.session.add(tournament)
        db.session.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 422
    return jsonify({'message': 'Tournament created successfully', 'id': tournament.id}), 201

@bp.route('/tournaments/<int:tournament_id>/join', methods=['POST'])
@jwt_required()
def join_tournament(tournament_id):
    current_user_id = get_jwt_identity()
    tournament = Tournament.query.get_or_404(tournament_id)
    
    if tournament.status != 'pending':
        return jsonify({'error': 'Tournament is not accepting participants'}), 400
        
    if TournamentParticipant.query.filter_by(
        tournament_id=tournament_id,
        user_id=current_user_id
    ).first():
        return jsonify({'error': 'Already registered'}), 400
        
    participant = TournamentParticipant(
        tournament_id=tournament_id,
        user_id=current_user_id
    )
    
    db.session.add(participant)
    db.session.commit()
    
    return jsonify({'message': 'Successfully joined tournament'}), 201

@bp.route('/tournaments/<int:tournament_id>', methods=['GET'])
def get_tournament(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    participants = [
        {
            'id': p.id,
            'user_id': p.user_id,
            'username': p.user.username if p.user_id and hasattr(p, 'user') and p.user else p.guest_name,
            'email': p.user.email if p.user_id and hasattr(p, 'user') and p.user else None,
            'guest_name': p.guest_name,
            'status': p.status
        }
        for p in tournament.participants
    ]
    matches = [
        {
            'id': m.id,
            'round': m.round,
            'player1_id': m.player1_id,
            'player2_id': m.player2_id,
            'score1': m.score1,
            'score2': m.score2,
            'winner_id': m.winner_id,
            'status': m.status
        }
        for m in tournament.matches
    ]
    return jsonify({
        'id': tournament.id,
        'name': tournament.name,
        'description': tournament.description,
        'game_type': tournament.game_type,
        'format': tournament.format,
        'status': tournament.status,
        'creator_id': tournament.creator_id,
        'max_participants': tournament.max_participants,
        'participants': participants,
        'matches': matches,
    })

@bp.route('/tournaments/<int:tournament_id>', methods=['PUT'])
@jwt_required()
def update_tournament(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    current_user_id = get_jwt_identity()
    if str(tournament.creator_id) != current_user_id:
        return jsonify({'error': 'Only the creator can modify this tournament'}), 403
    data = request.get_json()
    for field in ['name', 'description', 'game_type', 'max_participants', 'format', 'status']:
        if field in data:
            setattr(tournament, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Tournament updated successfully'})

@bp.route('/tournaments/<int:tournament_id>', methods=['DELETE'])
@jwt_required()
def delete_tournament(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    current_user_id = get_jwt_identity()
    if str(tournament.creator_id) != current_user_id:
        return jsonify({'error': 'Only the creator can delete this tournament'}), 403
    db.session.delete(tournament)
    db.session.commit()
    return jsonify({'message': 'Tournament deleted successfully'})

@bp.route('/tournaments/<int:tournament_id>/add_participant', methods=['POST'])
@jwt_required()
def add_participant(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    current_user_id = get_jwt_identity()
    if str(tournament.creator_id) != current_user_id:
        return jsonify({'error': 'Only the creator can add participants'}), 403
    data = request.get_json()
    email = data.get('email')
    guest_name = data.get('guest_name')
    if not email and not guest_name:
        return jsonify({'error': 'email or guest_name is required'}), 400
    if email:
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if TournamentParticipant.query.filter_by(tournament_id=tournament_id, user_id=user.id).first():
            return jsonify({'error': 'User already a participant or has a pending request'}), 400
        participant = TournamentParticipant(
            tournament_id=tournament_id,
            user_id=user.id,
            status='accepted'
        )
    else:
        # Ajout d'un invité
        if TournamentParticipant.query.filter_by(tournament_id=tournament_id, guest_name=guest_name).first():
            return jsonify({'error': 'Guest already a participant'}), 400
        participant = TournamentParticipant(
            tournament_id=tournament_id,
            guest_name=guest_name,
            status='accepted'
        )
    db.session.add(participant)
    db.session.commit()
    return jsonify({'message': 'Participant added successfully'})

@bp.route('/tournaments/<int:tournament_id>/request_join', methods=['POST'])
@jwt_required()
def request_join(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    current_user_id = get_jwt_identity()
    existing = TournamentParticipant.query.filter_by(tournament_id=tournament_id, user_id=current_user_id).first()
    if existing:
        if existing.status == 'rejected':
            existing.status = 'pending'
            db.session.commit()
            return jsonify({'message': 'Join request sent again'})
        else:
            return jsonify({'error': 'Already requested or already a participant'}), 400
    participant = TournamentParticipant(
        tournament_id=tournament_id,
        user_id=current_user_id,
        status='pending'
    )
    db.session.add(participant)
    db.session.commit()
    return jsonify({'message': 'Join request sent'})

@bp.route('/tournaments/<int:tournament_id>/handle_request', methods=['POST'])
@jwt_required()
def handle_request(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    current_user_id = get_jwt_identity()
    if str(tournament.creator_id) != current_user_id:
        return jsonify({'error': 'Only the creator can handle requests'}), 403
    data = request.get_json()
    participant_id = data.get('participant_id')
    action = data.get('action')  # 'accept' or 'reject'
    participant = TournamentParticipant.query.filter_by(id=participant_id, tournament_id=tournament_id).first()
    if not participant:
        return jsonify({'error': 'Request not found'}), 404
    if action == 'accept':
        participant.status = 'accepted'
    elif action == 'reject':
        participant.status = 'rejected'
    else:
        return jsonify({'error': 'Invalid action'}), 400
    db.session.commit()
    return jsonify({'message': f'Request {action}ed'})

@bp.route('/tournaments/<int:tournament_id>/participants', methods=['GET'])
def get_tournament_participants(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    participants = tournament.participants.all()
    return jsonify([
        {
            'id': p.id,
            'user_id': p.user_id,
            'status': p.status
        } for p in participants
    ])

@bp.route('/tournaments/<int:tournament_id>/matches', methods=['GET'])
def get_tournament_matches(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    matches = tournament.matches.all()
    return jsonify([
        {
            'id': m.id,
            'round': m.round,
            'player1_id': m.player1_id,
            'player2_id': m.player2_id,
            'score1': m.score1,
            'score2': m.score2,
            'winner_id': m.winner_id,
            'status': m.status
        } for m in matches
    ])

@bp.route('/tournaments/<int:tournament_id>/leave', methods=['POST'])
@jwt_required()
def leave_tournament(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    current_user_id = get_jwt_identity()
    if str(tournament.creator_id) == current_user_id:
        return jsonify({'error': 'Creator cannot leave their own tournament'}), 403
    participant = TournamentParticipant.query.filter_by(tournament_id=tournament_id, user_id=current_user_id).first()
    if not participant:
        return jsonify({'error': 'You are not a participant'}), 400
    db.session.delete(participant)
    db.session.commit()
    return jsonify({'message': 'You have left the tournament'})

@bp.route('/tournaments/<int:tournament_id>/kick', methods=['POST'])
@jwt_required()
def kick_participant(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    current_user_id = get_jwt_identity()
    if str(tournament.creator_id) != current_user_id:
        return jsonify({'error': 'Only the creator can kick participants'}), 403
    data = request.get_json()
    participant_id = data.get('participant_id')
    participant = TournamentParticipant.query.filter_by(id=participant_id, tournament_id=tournament_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404
    if str(participant.user_id) == current_user_id:
        return jsonify({'error': 'Creator cannot kick themselves'}), 400
    db.session.delete(participant)
    db.session.commit()
    return jsonify({'message': 'Participant has been removed'})

@bp.route('/tournaments/<int:tournament_id>/bracket', methods=['GET'])
def get_bracket(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    return jsonify({'bracket': tournament.bracket})

@bp.route('/tournaments/<int:tournament_id>/bracket', methods=['POST'])
@jwt_required()
def save_bracket(tournament_id):
    tournament = Tournament.query.get_or_404(tournament_id)
    current_user_id = get_jwt_identity()
    if str(tournament.creator_id) != current_user_id:
        return jsonify({'error': 'Only the creator can modify the bracket'}), 403
    
    data = request.get_json()
    bracket = data.get('bracket')
    
    if bracket is None:
        return jsonify({'error': 'No bracket data provided'}), 400
    if isinstance(bracket, dict) and 'main' in bracket and 'loser' in bracket:
        if not isinstance(bracket['main'], list) or not isinstance(bracket['loser'], list):
            return jsonify({'error': 'Invalid bracket format for double elimination'}), 400
    elif not isinstance(bracket, list):
        return jsonify({'error': 'Invalid bracket format'}), 400
    
    try:
        tournament.bracket = bracket
        db.session.commit()
        return jsonify({'message': 'Bracket saved successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error saving bracket: {str(e)}'}), 500 