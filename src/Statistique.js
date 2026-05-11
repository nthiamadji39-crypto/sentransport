import './Statistique.css';

function Statistique({ lignes }) {
  // Calculs dynamiques
  const totalLignes = lignes.length;
  const totalArrets = lignes.reduce((acc, ligne) => acc + ligne.arrets, 0);
  const ligneMax = lignes.reduce((prev, current) => (prev.arrets > current.arrets) ? prev : current);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '20px' }}>
      <div className="stat-card">
        <h3 className="stat-chiffre">{totalLignes}</h3>
        <p className="stat-label">Lignes de bus</p>
      </div>
      <div className="stat-card">
        <h3 className="stat-chiffre">{totalArrets}</h3>
        <p className="stat-label">Total arrêts</p>
      </div>
      <div className="stat-card">
        <h3 className="stat-chiffre">{ligneMax.numero}</h3>
        <p className="stat-label">Ligne la plus longue ({ligneMax.arrets} arrêts)</p>
      </div>
    </div>
  );
}

export default Statistique;