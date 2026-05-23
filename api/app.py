import json
from flask import Flask, jsonify, request  # ← request ajouté ici
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

with open("lignes_ddd.json", "r") as f:
    lignes = json.load(f)

#lab 6
with open("arrets.json", "r") as f:
    arrets = json.load(f)

@app.route("/arrets")
def get_arrets():
    return jsonify(arrets)

@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>"]
    })

@app.route("/lignes")
def get_lignes():
    return jsonify(lignes)

@app.route("/lignes/<int:ligne_id>")
def get_ligne(ligne_id):
    ligne = next(
        (l for l in lignes if l["id"] == ligne_id),
        None
    )
    if ligne is None:
        return jsonify({"erreur": "Ligne non trouvee"}), 404
    return jsonify(ligne)

# Exercice 1
@app.route("/arrets/liste")
def get_arrets_liste():
    tous_arrets = set()
    for ligne in lignes:
        for arret in ligne["listeArrets"]:
            tous_arrets.add(arret)
    return jsonify(sorted(list(tous_arrets)))

# Exercice 2
@app.route("/stats")
def get_stats():
    total_arrets = sum(l["arrets"] for l in lignes)
    ligne_max = max(lignes, key=lambda l: l["arrets"])
    return jsonify({
        "nombre_lignes": len(lignes),
        "total_arrets": total_arrets,
        "ligne_plus_darrets": {
            "numero": ligne_max["numero"],
            "arrets": ligne_max["arrets"]
        }
    })

# Exercice 3
@app.route("/lignes/recherche")
def recherche_lignes():
    q = request.args.get("q", "").lower()
    resultats = [
        l for l in lignes
        if q in l["depart"].lower() or q in l["arrivee"].lower()
    ]
    return jsonify(resultats)

if __name__ == "__main__":
    app.run(debug=True, port=5000)