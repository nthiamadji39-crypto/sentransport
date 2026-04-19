import './App.css';
import Header from './Header';
import Footer from './Footer';
import Statistique from './Statistique'; // 1. Import du nouveau composant

function App() {
  return (
    <div className="App">
      <Header />
      
      <main className="contenu">
        <p>Bienvenue ! Cette application vous aide à trouver votre ligne de bus à Dakar.</p>
        
        <div className="stats-container">
          <Statistique />
          <Statistique />
          <Statistique />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;