# Plateforme de Tournois

Une application web pour gérer tous types de tournois, développée avec React (frontend) et Flask (backend).

## Prérequis

- Python 3.8 ou supérieur
- Node.js 16 ou supérieur
- Git

> Note : Le projet utilise SQLite par défaut, donc aucune base de données supplémentaire n'est nécessaire pour le lancer. PostgreSQL est une option alternative qui peut être configurée si nécessaire.

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

2. Initialiser la base de données :
```bash
flask db upgrade
```

### 3. Configuration du Frontend

1. Installer les dépendances Node.js :
```bash
cd frontend
npm install
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
