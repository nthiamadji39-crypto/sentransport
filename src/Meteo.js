import { useState, useEffect } from 'react';
import './Meteo.css';

function Meteo() {
    const [meteo, setMeteo] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [previsions, setPrevisions] = useState([]); //exo2 lab7

    useEffect(() => {
        const API_KEY = process.env.REACT_APP_OWM_KEY;

        if (!API_KEY) {
            setErreur("Clé API manquante (.env)");
            return;
        }

        // ✅ APRÈS — recherche par coordonnées GPS (plus fiable)
        const url =
            `https://api.openweathermap.org/data/2.5/weather`
            + `?lat=14.6928&lon=-17.4467&appid=${API_KEY}`
            + `&units=metric&lang=fr`;

        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error("Erreur : " + r.status);
                return r.json();
            })
            .then(data => {
                setMeteo({
                    temperature: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    condition: data.weather[0].main,
                    humidite: data.main.humidity,
                    icone: data.weather[0].icon,
                });
            })
            .catch(err => setErreur(err.message));
    }, []);

    // ✅ useEffect prévisions — aussi avant tout return eexo 2
    useEffect(() => {
        const API_KEY = process.env.REACT_APP_OWM_KEY;
        if (!API_KEY) return;

        // Prévisions 5 jours
        const urlPrev =
            `https://api.openweathermap.org/data/2.5/forecast`
            + `?lat=14.6928&lon=-17.4467&appid=${API_KEY}`
            + `&units=metric&lang=fr&cnt=24`;

        fetch(urlPrev)
            .then(r => r.json())
            .then(data => {
                // Garder une entrée par jour (toutes les 8 mesures = 24h)
                const parJour = data.list.filter((_, i) => i % 8 === 0).slice(0, 3);
                setPrevisions(parJour);
            })
            .catch(err => console.error("Erreur prévisions :", err));
    }, []);

    function getAlerte(condition) {
        if (condition === "Rain" || condition === "Drizzle") {
            return { message: "Pluie détectée — risque de retards", classe: "alerte-pluie" };
        }
        if (condition === "Thunderstorm") {
            return { message: "Orage en cours — soyez prudents", classe: "alerte-orage" };
        }
        return null;
    }

    // ✅ Returns conditionnels
    if (erreur) {
        return (
            <div className="meteo meteo-erreur">
                <p>Météo indisponible</p>
                <p className="meteo-detail">{erreur}</p>
            </div>
        );
    }

    if (!meteo) {
        return <div className="meteo">Chargement météo...</div>;
    }

    const alerte = getAlerte(meteo.condition);

    return (
        <div className="meteo">
            <div className="meteo-info">
                <img
                    src={`https://openweathermap.org/img/wn/${meteo.icone}@2x.png`}
                    alt={meteo.description}
                    className="meteo-icone"
                />
                <div>
                    <span className="meteo-temp">{meteo.temperature}°C</span>
                    <span className="meteo-desc">{meteo.description}</span>
                </div>
                <span className="meteo-humidite">Humidité : {meteo.humidite}%</span>
            </div>
            {alerte && (
                <div className={`meteo-alerte ${alerte.classe}`}>
                    {alerte.message}
                </div>
            )}
        
        {/* ✅ Prévisions DANS le même return */}
        {previsions.length > 0 && (
            <div className="previsions">
                <p className="previsions-titre">Prévisions :</p>
                <div className="previsions-liste">
                    {previsions.map((p, i) => (
                        <div key={i} className="prevision-item">
                            <span className="prev-jour">
                                {new Date(p.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short' })}
                            </span>
                            <img
                                src={`https://openweathermap.org/img/wn/${p.weather[0].icon}.png`}
                                alt={p.weather[0].description}
                                className="prev-icone"
                            />
                            <span className="prev-temp">{Math.round(p.main.temp)}°C</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
    );

}

export default Meteo;