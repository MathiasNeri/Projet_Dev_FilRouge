# Présentation du projet

## Compte rendu
Ce projet est une plateforme web de gestion de tournois, permettant la création, l'inscription, le suivi et la gestion de tournois à élimination simple ou double. L'application propose une interface moderne pour les organisateurs et les participants, avec une gestion automatisée des brackets, des inscriptions, et des résultats.

## Technologies utilisées
- **Frontend** : React.js (avec TypeScript)
- **Backend** : Flask (Python) avec Flask-RESTful, Flask-Migrate, Flask-JWT-Extended
- **Base de données** : PostgreSQL
- **ORM** : SQLAlchemy
- **Migrations** : Alembic
- **Outils de visualisation** : pgAdmin, DBeaver, Graphviz (pour la génération de schémas)

## Comment ça marche ?
1. **Création de tournoi** : Un utilisateur peut créer un tournoi en choisissant le format (simple/double élimination), le jeu, et le nombre de participants.
2. **Inscriptions** : Les utilisateurs peuvent s'inscrire à un tournoi jusqu'à ce que le nombre maximum de participants soit atteint.
3. **Placement et génération du bracket** : Une fois le tournoi complet, l'organisateur valide le placement des équipes et le bracket est généré automatiquement.
4. **Suivi des matchs** : Les résultats des matchs sont saisis, les gagnants avancent automatiquement dans le bracket (y compris loser bracket pour le double élimination).
5. **Visualisation** : Les participants et spectateurs peuvent suivre l'évolution du tournoi en temps réel.
6. **Gestion** : L'organisateur peut réinitialiser le bracket, gérer les inscriptions, et clôturer le tournoi.

## Description de la base de données
La base de données est structurée autour de 4 tables principales :

- **user** :
    - id (PK)
    - username
    - email
    - password_hash
    - Relations : un utilisateur peut créer plusieurs tournois et participer à plusieurs tournois.

- **tournament** :
    - id (PK)
    - name, description, game_type, format, status, max_participants, bracket (JSON)
    - creator_id (FK vers user)
    - Relations : un tournoi appartient à un créateur, possède plusieurs participants et plusieurs matchs.

- **tournament_participant** :
    - id (PK)
    - tournament_id (FK vers tournament)
    - user_id (FK vers user, nullable pour les invités)
    - guest_name (pour les invités)
    - status
    - Relations : relie un utilisateur (ou invité) à un tournoi.

- **match** :
    - id (PK)
    - tournament_id (FK vers tournament)
    - round
    - player1_id, player2_id, winner_id (FK vers user)
    - score1, score2, status
    - Relations : chaque match appartient à un tournoi et relie deux joueurs (ou équipes).

**Schéma relationnel** :
- Un utilisateur peut créer plusieurs tournois (user → tournament)
- Un tournoi a plusieurs participants (tournament → tournament_participant)
- Un tournoi a plusieurs matchs (tournament → match)
- Un participant est lié à un utilisateur ou un invité (tournament_participant → user)
- Un match relie deux joueurs (match → user)


---

# Projet Dev Fil Rouge

## Installation Initiale

### Backend (Python/Flask)

1. Installer les dépendances (une seule fois) :
```bash
cd backend
pip install -r requirements.txt
```

2. Configuration de la base de données :
   - Assurez-vous que PostgreSQL est installé et en cours d'exécution
   - Créez un fichier `.env` dans le dossier `backend` avec :
   ```
   SECRET_KEY=votre_secret_key_ici
   JWT_SECRET_KEY=votre_secret_key_ici
   ```
   - Initialisez la base de données :
   ```bash
   python init_db.py
   ```

### Frontend (React)

1. Installer les dépendances (une seule fois) :
```bash
cd frontend
npm install
```

2. Configuration :
   - Créez un fichier `.env` dans le dossier `frontend` avec :
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

## Démarrage Quotidien

1. Démarrer PostgreSQL

2. Lancer le backend :
```bash
cd backend
python wsgi.py
```

3. Lancer le frontend :
```bash
cd frontend
npm start
```

L'application sera accessible à l'adresse : http://localhost:3000

## Structure du Projet

### Backend
- `app/` : Code source principal
  - `models/` : Modèles de données
  - `routes/` : Routes API
  - `__init__.py` : Configuration de l'application
- `config.py` : Configuration globale
- `wsgi.py` : Point d'entrée
- `init_db.py` : Script d'initialisation de la base de données

### Frontend
- `src/` : Code source React
  - `components/` : Composants réutilisables
  - `pages/` : Pages de l'application
  - `contexts/` : Contextes React (auth, etc.)
  - `config.ts` : Configuration

## Fonctionnalités

- Authentification (inscription/connexion)
- Gestion des tournois
- Interface utilisateur moderne et responsive
