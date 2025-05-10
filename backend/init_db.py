import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    # Connexion à PostgreSQL
    conn = psycopg2.connect(
        user="postgres",
        password="root",
        host="localhost",
        port="5432"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    # Création du curseur
    cur = conn.cursor()
    
    try:
        # Création de la base de données
        cur.execute("CREATE DATABASE app")
        print("Base de données 'app' créée avec succès!")
    except psycopg2.Error as e:
        print(f"Erreur lors de la création de la base de données: {e}")
    finally:
        # Fermeture de la connexion
        cur.close()
        conn.close()

if __name__ == "__main__":
    create_database() 