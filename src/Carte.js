import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; //useMap exo 2 lab 6


//exo 1 lab 6
// Icône orange pour l'arrêt le plus proche
const iconeProche = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});


// Fix obligatoire pour les icônes Leaflet avec webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Formule de Haversine : distance entre 2 points GPS (en km)
function calculerDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Composant interne qui accède à l'objet carte : exo 2 lab 6
function BoutonCentrer({ position }) {
    const map = useMap();

    if (!position) return null;

    return (
        <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
            <button
                className="btn-centrer"
                onClick={() => map.setView(position, 15)}
            >
                📍 Ma position
            </button>
        </div>
    );
}

function Carte() {
    const [arrets, setArrets] = useState([]);
    const [positionUtilisateur, setPositionUtilisateur] = useState(null);
    const [arretProche, setArretProche] = useState(null);

    const DAKAR = [14.6928, -17.4467];

    // 1. Charger les arrêts depuis Flask
    useEffect(() => {
        fetch("http://localhost:5000/arrets")
            .then(r => r.json())
            .then(data => setArrets(data))
            .catch(err => console.error("Erreur arrêts :", err));
    }, []);

    // 2. Géolocalisation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => setPositionUtilisateur([pos.coords.latitude, pos.coords.longitude]),
                () => console.log("Géolocalisation refusée")
            );
        }
    }, []);

    // 3. Trouver l'arrêt le plus proche
    // état
    const [arretsProches, setArretsProches] = useState([]);

    // useEffect
    useEffect(() => {
        if (positionUtilisateur && arrets.length > 0) {
            const avecDistance = arrets.map(a => ({
                ...a,
                distance: calculerDistance(positionUtilisateur[0], positionUtilisateur[1], a.lat, a.lon)
            }));
            const top3 = avecDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
            setArretsProches(top3);
        }
    }, [positionUtilisateur, arrets]);

    // affichage
    {
        arretsProches.length > 0 && (
            <div className="arret-proche">
                <p>🚏 Arrêts les plus proches :</p>
                <ul>
                    {arretsProches.map(a => (
                        <li key={a.id}>
                            <strong>{a.nom}</strong> ({a.distance.toFixed(1)} km)
                        </li>
                    ))}
                </ul>
            </div>
        )
    }


    return (
        <div className="carte-container">
            <h2 className="carte-titre">Carte des arrêts</h2>
            {arretsProches.length > 0 && (
                <div className="arrets-proches-liste">
                    <p className="arrets-proches-titre">📍 Arrêts les plus proches :</p>
                    {arretsProches.map((a, index) => (
                        <p key={a.id} className="arret-proche">
                            {index + 1}. <strong>{a.nom}</strong> — {a.distance.toFixed(1)} km
                            <span className="arret-lignes"> (Lignes : {a.lignes.join(", ")})</span>
                        </p>
                    ))}
                </div>
            )}
            <MapContainer center={DAKAR} zoom={13} className="carte">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />
                <BoutonCentrer position={positionUtilisateur} />

                {arrets.map(a => (
                    <Marker key={a.id} position={[a.lat, a.lon]}>
                        <Popup>
                            <strong>{a.nom}</strong><br />
                            Lignes : {a.lignes.join(", ")}
                        </Popup>
                    </Marker>
                ))}

        //exo 1 lab 6
                {arrets.map(a => (
                    <Marker
                        key={a.id}
                        position={[a.lat, a.lon]}
                        icon={arretsProches.some(p => p.id === a.id) ? iconeProche : new L.Icon.Default()}

                    >
                        <Popup>
                            <strong>{a.nom}</strong><br />
                            Lignes : {a.lignes.join(", ")}
                            {arretProche && arretProche.id === a.id && (
                                <><br /><em>⭐ Arrêt le plus proche</em></>
                            )}
                        </Popup>
                    </Marker>
                ))}
                {positionUtilisateur && (
                    <Marker position={positionUtilisateur}>
                        <Popup>Vous êtes ici</Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}

export default Carte;