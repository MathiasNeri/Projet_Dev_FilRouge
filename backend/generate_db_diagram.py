from app import create_app, db
from app.models import user, tournament

app = create_app()

with app.app_context():
    # Créer le fichier DOT
    with open('db_schema.dot', 'w') as f:
        f.write('digraph Database {\n')
        f.write('    rankdir=LR;\n')
        f.write('    node [shape=box, style=filled, fillcolor=lightblue];\n\n')
        
        # Écrire les tables
        for table in db.metadata.tables.values():
            f.write(f'    {table.name} [label="{table.name}"];\n')
        
        f.write('\n')
        
        # Écrire les relations
        for table in db.metadata.tables.values():
            for fk in table.foreign_keys:
                target_table = fk.target_fullname.split('.')[0]
                f.write(f'    {table.name} -> {target_table};\n')
        
        f.write('}\n')

print("Diagramme généré dans 'db_schema.dot'")
print("Pour le visualiser, installez Graphviz et exécutez :")
print("dot -Tpng db_schema.dot -o db_schema.png") 