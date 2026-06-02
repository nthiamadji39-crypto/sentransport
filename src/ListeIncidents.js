import { useState, useEffect } from 'react';
import './ListeIncidents.css';

function ListeIncidents() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/incidents")
      .then(r => r.json())
      .then(data => setIncidents(data))
      .catch(err => console.error("Erreur incidents :", err));
  }, []);

  if (incidents.length === 0) {
    return (
      <div className="liste-incidents">
        <h3 className="liste-incidents-titre">Incidents signalés</h3>
        <p className="liste-vide">Aucun incident signalé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="liste-incidents">
      <h3 className="liste-incidents-titre">
        Incidents signalés ({incidents.length})
      </h3>
      {incidents.map(incident => (
        <div key={incident.id} className="incident-item">
          <span className="incident-ligne">Ligne {incident.ligne}</span>
          <div className="incident-details">
            <p className="incident-description">{incident.description}</p>
            <p className="incident-lieu">📍 {incident.lieu}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListeIncidents;