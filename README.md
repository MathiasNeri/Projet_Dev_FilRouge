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

# Plateforme de Tournois

Une application web pour gérer tous types de tournois, développée avec React (frontend) et Flask (backend).

## Prérequis

- Python 3.8 ou supérieur
- Node.js 16 ou supérieur
- Git
- PostgreSQL (pour la base de données)

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/MathiasNeri/Projet_Dev_FilRouge.git
cd Projet_Dev_FilRouge
```

### 2. Configuration du Backend

1. Installer les dépendances Python :
```bash
cd backend
pip install -r requirements.txt
```

2. Créer un fichier `.env` dans le dossier `backend` avec les variables suivantes :
```env
FLASK_APP=wsgi.py
FLASK_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/app
JWT_SECRET_KEY=votre_secret_key_ici
```

Remplacez :
- `username` et `password` par vos identifiants PostgreSQL
- `votre_secret_key_ici` par une chaîne de caractères aléatoire sécurisée

3. Créer la base de données PostgreSQL :
```bash
# Dans psql ou pgAdmin
CREATE DATABASE app;
```

4. Initialiser la base de données :
```bash
flask db upgrade
```

### 3. Configuration du Frontend

1. Installer les dépendances Node.js :
```bash
cd frontend
npm install
```

2. Créer un fichier `.env` dans le dossier `frontend` avec :
```env
REACT_APP_API_URL=http://localhost:5000
```

## Lancement de l'application

### 1. Démarrer le Backend

Dans le dossier `backend` :
```bash
python wsgi.py
```

Le serveur backend sera accessible sur `http://localhost:5000`

### 2. Démarrer le Frontend

Dans le dossier `frontend` :
```bash
npm start
```

L'application frontend sera accessible sur `http://localhost:3000`

## Utilisation

1. Créer un compte ou se connecter
2. Créer un tournoi en spécifiant :
   - Nom
   - Description
   - Type de jeu
   - Format
   - Dates de début et fin
   - Nombre maximum de participants

3. Gérer les participants :
   - Accepter/refuser les demandes d'inscription
   - Exclure des participants
   - Voir la liste des participants

4. Participer à un tournoi :
   - Demander à rejoindre
   - Voir les détails
   - Quitter le tournoi

## Structure du Projet

```
Projet_Dev_FilRouge/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── migrations/
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   └── services/
    └── package.json
```

## Fonctionnalités

- Authentification des utilisateurs
- Création et gestion de tournois
- Système de demande d'inscription
- Gestion des participants
- Interface utilisateur responsive
- Notifications en temps réel

## Technologies Utilisées

- **Frontend** :
  - React
  - Material-UI
  - Axios
  - TypeScript

- **Backend** :
  - Flask
  - SQLAlchemy
  - Flask-JWT-Extended
  - SQLite (base de données locale)
