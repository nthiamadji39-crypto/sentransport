import { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Footer from './Footer';
import Carte from './Carte';

function App() {

  // Les trois états essentiels
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);
  const [nbRecherches, setNbRecherches] = useState(0); // nouveau exo 3 lab3
  const [detailsLigne, setDetailsLigne] = useState(null); //exo 3 lab 5
  const [chargementDetails, setChargementDetails] = useState(false); //exo3 lab 5


  //exercice 1 lab 5
  // Fonction réutilisable (utilisée par useEffect + bouton)
  function chargerLignes() {
    setChargement(true);
    setErreur(null);
    fetch("http://localhost:5000/lignes")
      .then(response => {
        if (!response.ok) throw new Error("Erreur serveur : " + response.status);
        return response.json();
      })
      .then(data => {
        setLignes(data);
        setChargement(false);
      })
      .catch(error => {
        setErreur(error.message);
        setChargement(false);
      });
  }


  // Charger les données au démarrage
  useEffect(() => {
    fetch("http://localhost:5000/lignes")
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur serveur : " + response.status);
        }
        return response.json();
      })
      .then(data => {
        setLignes(data);
        setChargement(false);
      })
      .catch(error => {
        setErreur(error.message);
        setChargement(false);
      });
  }, []); // ← le [] vide est OBLIGATOIRE

  const lignesFiltrees = lignes.filter(l =>
    l.depart.toLowerCase().includes(recherche.toLowerCase()) ||
    l.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
    l.numero.includes(recherche)
  );

  //exo3 lab3
  function handleClickLigne(ligne) {
    // Désélectionner si on reclique sur la même ligne
    if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
      setLigneSelectionnee(null);
      setDetailsLigne(null);
      return;
    }

    setLigneSelectionnee(ligne);
    setChargementDetails(true);
    setDetailsLigne(null);

    // Charger les détails depuis Flask
    fetch(`http://localhost:5000/lignes/${ligne.id}`)
      .then(r => {
        if (!r.ok) throw new Error("Erreur " + r.status);
        return r.json();
      })
      .then(data => {
        setDetailsLigne(data);
        setChargementDetails(false);
      })
      .catch(() => {
        setChargementDetails(false);
      });
  }

  // exo 3 lab 3
  function handleRecherche(valeur) {
    setRecherche(valeur);
    setNbRecherches(n => n + 1);
  }

  // Écran de chargement
  if (chargement) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <p className="message-chargement">Chargement des lignes...</p>
        </main>
      </div>
    );
  }

  // Écran d'erreur
  if (erreur) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <div className="message-erreur">
            <p>Impossible de charger les lignes.</p>
            <p className="erreur-detail">{erreur}</p>
            <p>Vérifiez que le serveur Flask est lancé (python api/app.py).</p>
          </div>
        </main>
      </div>
    );
  }

  // Écran normal (return existant, inchangé)
  return (
    <div className="App">
      <Header />
      <main className="contenu">

        <button className="btn-recharger" onClick={chargerLignes}>
          🔄 Recharger les lignes
        </button>

        <Recherche valeur={recherche} onChange={handleRecherche} />
        {nbRecherches > 0 && (
          <p className="compteur-recherche">
            Vous avez effectué {nbRecherches} recherche{nbRecherches > 1 ? 's' : ''}
          </p>
        )}
        <p className="resultat-recherche">
          {lignesFiltrees.length} ligne{lignesFiltrees.length > 1 ? 's' : ''} trouvee{lignesFiltrees.length > 1 ? 's' : ''}
        </p>

        {/* Exercice 2 lab 3: message si aucun résultat */}
        {lignesFiltrees.length === 0 && (
          <p className="aucune-ligne">
            Aucune ligne trouvée pour "{recherche}"
          </p>
        )}

        {lignesFiltrees.map(ligne => (
          <LigneBus
            key={ligne.id}
            numero={ligne.numero}
            depart={ligne.depart}
            arrivee={ligne.arrivee}
            arrets={ligne.arrets}
            estSelectionnee={ligneSelectionnee && ligneSelectionnee.id === ligne.id}
            onClick={() => handleClickLigne(ligne)}
          />
        ))}
        {/* Exercice 3 lab 5 */}
        {chargementDetails && (
          <p className="message-chargement">Chargement des détails...</p>
        )}
        {detailsLigne && <DetailLigne ligne={detailsLigne} />}
        <Carte />   {/* ← NOUVEAU Lab 6*/}
      </main>
      <Footer />
    </div>
  );
}

export default App;