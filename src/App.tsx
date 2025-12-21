import { useState } from 'react';
import { motion } from 'framer-motion';
import { GenericAnimalApp } from './components/generic/GenericAnimalApp';
import { getAllAnimals, getAnimalConfig } from './config/animals';
import type { AnimalConfig } from './config/animals';
import './App.css';

function App() {
  const [currentAnimalId, setCurrentAnimalId] = useState<string | null>(null);
  
  const animals = getAllAnimals();
  const currentConfig = currentAnimalId ? getAnimalConfig(currentAnimalId) : null;

  // If an animal is selected, show its simulation
  if (currentConfig) {
    return (
      <GenericAnimalApp 
        config={currentConfig} 
        onBack={() => setCurrentAnimalId(null)} 
      />
    );
  }

  // Home screen - show all available animals
  return (
    <div className="home-app">
      <div className="home-background">
        {/* Dynamic background based on number of animals */}
        <div className="home-gradient-blend" />
      </div>
      
      <header className="home-header">
        <h1>🧬 Evolution Simulator 🧬</h1>
        <p className="home-subtitle">Learn how animals evolve through natural selection!</p>
      </header>

      <main className="home-content">
        <motion.div 
          className="home-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="home-description">
            Choose an animal to see how evolution works! Watch as traits change 
            over generations when facing different environmental challenges.
          </p>
        </motion.div>

        <div className="simulator-cards">
          {animals.map((animal, index) => (
            <AnimalCard 
              key={animal.id}
              animal={animal}
              index={index}
              onClick={() => setCurrentAnimalId(animal.id)}
            />
          ))}
        </div>

        <motion.div 
          className="home-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + animals.length * 0.1 }}
        >
          <h3>🎓 What You'll Learn</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-emoji">🔄</span>
              <span>How traits are inherited from parents to offspring</span>
            </div>
            <div className="info-item">
              <span className="info-emoji">🎯</span>
              <span>How the environment affects which animals survive</span>
            </div>
            <div className="info-item">
              <span className="info-emoji">📈</span>
              <span>How populations change over many generations</span>
            </div>
            <div className="info-item">
              <span className="info-emoji">⚖️</span>
              <span>Why some traits can be good AND bad (trade-offs!)</span>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="home-footer">
        <p>An educational tool for learning about evolution and natural selection</p>
      </footer>
    </div>
  );
}

// Card component for each animal on the home screen
function AnimalCard({ 
  animal, 
  index, 
  onClick 
}: { 
  animal: AnimalConfig; 
  index: number; 
  onClick: () => void;
}) {
  return (
    <motion.button
      className="simulator-card"
      style={{
        borderTopColor: animal.theme.primary,
      }}
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="card-emoji">{animal.emoji}</div>
      <h2 style={{ color: animal.theme.secondary }}>{animal.name}</h2>
      <p className="card-environment" style={{ color: animal.theme.primary }}>
        {animal.environment.emoji} {animal.environment.name}
      </p>
      <div className="card-traits">
        {animal.traits.map(trait => (
          <span 
            key={trait.id}
            style={{ 
              background: `${animal.theme.primary}20`,
              color: animal.theme.secondary 
            }}
          >
            {trait.emoji} {trait.name}
          </span>
        ))}
      </div>
      <p className="card-description">
        Guide {animal.plural} through {animal.events.length} different challenges!
      </p>
      <span 
        className="play-button"
        style={{ 
          background: `linear-gradient(135deg, ${animal.theme.primary} 0%, ${animal.theme.secondary} 100%)` 
        }}
      >
        Play Now →
      </span>
    </motion.button>
  );
}

export default App;
