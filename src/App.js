import { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Footer from './Footer';

function App() {

  // Les trois états essentiels
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);
  const [nbRecherches, setNbRecherches] = useState(0); // nouveau exo 3 lab3


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

  function handleClickLigne(ligne) {
    if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
      setLigneSelectionnee(null);
    } else {
      setLigneSelectionnee(ligne);
    }
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
      {ligneSelectionnee && <DetailLigne ligne={ligneSelectionnee} />}
    </main>
    <Footer />
  </div>
  );
}

export default App;