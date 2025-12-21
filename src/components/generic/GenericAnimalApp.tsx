import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Animal, PopulationStats, GamePhase } from '../../types/animal';
import type { AnimalConfig } from '../../config/animals';
import { 
  createInitialPopulation, 
  createOffspring, 
  calculateAverageTraits, 
  resetUsedNames 
} from '../../types/animal';
import { AnimalCard } from './AnimalCard';
import { AnimalPopulationStats } from './AnimalPopulationStats';
import { AnimalEnvironmentSelector } from './AnimalEnvironmentSelector';
import './GenericAnimalApp.css';

interface GenericAnimalAppProps {
  config: AnimalConfig;
  onBack: () => void;
}

export function GenericAnimalApp({ config, onBack }: GenericAnimalAppProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [generation, setGeneration] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [history, setHistory] = useState<PopulationStats[]>([]);
  const [message, setMessage] = useState<string>('');
  const [totalSurvived, setTotalSurvived] = useState(0);
  const [totalLost, setTotalLost] = useState(0);
  const aliveBeforeSurvivalRef = useRef(0);
  const hasCountedRef = useRef(false);

  const theme = config.theme;

  // Calculate survival counts when results phase is reached
  useEffect(() => {
    if (phase === 'results' && !hasCountedRef.current) {
      hasCountedRef.current = true;
      const aliveAfter = animals.filter(a => a.isAlive).length;
      const aliveBefore = aliveBeforeSurvivalRef.current;
      const deaths = aliveBefore - aliveAfter;
      
      setTotalSurvived(prev => prev + aliveAfter);
      setTotalLost(prev => prev + deaths);
    }
  }, [phase, animals]);

  // Start the game
  const startGame = useCallback(() => {
    resetUsedNames(config.id);
    const initialPopulation = createInitialPopulation(config, 8);
    setAnimals(initialPopulation);
    setGeneration(1);
    setHistory([]);
    setTotalSurvived(0);
    setTotalLost(0);
    setPhase('select_event');
    setMessage(`Meet your ${config.singular} family! Choose what challenge they will face.`);
  }, [config]);

  // Handle environment event selection
  const handleSelectEvent = useCallback((eventId: string) => {
    setCurrentEventId(eventId);
    setPhase('survival');
    hasCountedRef.current = false;
    
    const event = config.events.find(e => e.id === eventId)!;
    setMessage(`${event.emoji} ${event.name}! Let's see which ${config.plural} survive...`);
    
    // Store alive count before survival
    aliveBeforeSurvivalRef.current = animals.filter(a => a.isAlive).length;
    
    // Apply survival logic after a short delay
    setTimeout(() => {
      setAnimals(currentAnimals => {
        return currentAnimals.map(animal => {
          if (!animal.isAlive) return animal;
          
          // Get trait value (flip for "high is bad" events)
          let effectiveTrait = animal.traits[event.dangerousTrait];
          if (event.traitDirection === 'high') {
            effectiveTrait = 100 - effectiveTrait;
          }
          
          // Strong selection using sigmoid curve
          const sigmoid = 1 / (1 + Math.exp(-0.15 * (effectiveTrait - 50)));
          const survivalChance = 0.02 + sigmoid * 0.96;
          
          return { ...animal, isAlive: Math.random() < survivalChance };
        });
      });
      
      setTimeout(() => setPhase('results'), 1500);
    }, 1000);
  }, [config, animals]);

  // Proceed to breeding phase
  const proceedToBreeding = useCallback(() => {
    const aliveAnimals = animals.filter(a => a.isAlive);
    
    if (aliveAnimals.length === 0) {
      setMessage(`Oh no! All the ${config.plural} are gone. Let's start over.`);
      setTimeout(() => setPhase('intro'), 2000);
      return;
    }
    
    // Save stats to history
    setHistory(prev => [...prev, {
      generation,
      averageTraits: calculateAverageTraits(aliveAnimals, config),
      populationSize: aliveAnimals.length,
      eventId: currentEventId || undefined
    }]);
    
    setPhase('breeding');
    setMessage(`Time for babies! ${config.emoji} Each ${config.singular} will have babies similar to them!`);
    
    // Create next generation after a delay
    setTimeout(() => {
      const nextGeneration = generation + 1;
      const newAnimals: Animal[] = [];
      
      // Each surviving animal has 2-3 offspring
      aliveAnimals.forEach(parent => {
        const numOffspring = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numOffspring; i++) {
          newAnimals.push(createOffspring(parent, config, nextGeneration));
        }
      });
      
      // Limit population
      const maxPopulation = 12;
      const finalAnimals = newAnimals.length > maxPopulation 
        ? newAnimals.sort(() => Math.random() - 0.5).slice(0, maxPopulation)
        : newAnimals;
      
      setAnimals(finalAnimals);
      setGeneration(nextGeneration);
      setCurrentEventId(null);
      
      setTimeout(() => {
        setPhase('select_event');
        setMessage(`Generation ${nextGeneration} is here! What challenge will they face?`);
      }, 1500);
    }, 2000);
  }, [animals, generation, currentEventId, config]);

  const aliveAnimals = animals.filter(a => a.isAlive);
  const deadAnimals = animals.filter(a => !a.isAlive);
  const currentEvent = currentEventId ? config.events.find(e => e.id === currentEventId) : null;

  return (
    <div className="generic-animal-app" style={{ background: theme.background }}>
      <header className="generic-app-header">
        <button 
          className="generic-back-button" 
          onClick={onBack}
          style={{ background: theme.primary }}
        >
          ← Back to Home
        </button>
        <h1 style={{ color: theme.secondary === '#1e3a5f' ? 'white' : theme.secondary }}>
          {config.emoji} {config.name} Evolution {config.emoji}
        </h1>
        <p 
          className="generic-subtitle"
          style={{ color: theme.secondary === '#1e3a5f' ? 'rgba(255,255,255,0.9)' : theme.secondary }}
        >
          Watch natural selection in action!
        </p>
      </header>

      {phase === 'intro' && (
        <motion.div 
          className="generic-intro-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="generic-intro-content" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
            <div className="intro-animal">{config.emoji}</div>
            <h2 style={{ color: theme.secondary }}>
              Welcome to the {config.environment.name}!
            </h2>
            <p className="generic-intro-tagline" style={{ color: theme.secondary }}>
              Learn how {config.plural} change over time through <strong>evolution!</strong>
            </p>
            
            <div className="generic-vocab-section">
              <h3 style={{ color: theme.secondary }}>🧬 Key Words to Know</h3>
              
              <div className="generic-vocab-grid">
                <div className="generic-vocab-card" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <span className="generic-vocab-emoji">🔄</span>
                  <span className="generic-vocab-term" style={{ color: theme.secondary }}>Evolution</span>
                  <span className="generic-vocab-def">When a group of animals slowly changes over many generations</span>
                </div>
                
                <div className="generic-vocab-card" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <span className="generic-vocab-emoji">👨‍👩‍👧</span>
                  <span className="generic-vocab-term" style={{ color: theme.secondary }}>Inheritance</span>
                  <span className="generic-vocab-def">Babies get traits from their parents!</span>
                </div>
                
                <div className="generic-vocab-card" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <span className="generic-vocab-emoji">🎲</span>
                  <span className="generic-vocab-term" style={{ color: theme.secondary }}>Variation</span>
                  <span className="generic-vocab-def">Not every {config.singular} is the same!</span>
                </div>
                
                <div className="generic-vocab-card" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <span className="generic-vocab-emoji">🎯</span>
                  <span className="generic-vocab-term" style={{ color: theme.secondary }}>Selection</span>
                  <span className="generic-vocab-def">Nature "picks" which animals survive</span>
                </div>
                
                <div className="generic-vocab-card" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <span className="generic-vocab-emoji">🦎</span>
                  <span className="generic-vocab-term" style={{ color: theme.secondary }}>Adaptation</span>
                  <span className="generic-vocab-def">A trait that helps an animal survive in its environment</span>
                </div>
                
                <div className="generic-vocab-card" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <span className="generic-vocab-emoji">💪</span>
                  <span className="generic-vocab-term" style={{ color: theme.secondary }}>Survival of the Fittest</span>
                  <span className="generic-vocab-def">{config.plural.charAt(0).toUpperCase() + config.plural.slice(1)} with the best traits for their environment survive and have more babies!</span>
                </div>
              </div>
            </div>
            
            <motion.button 
              className="generic-start-button"
              style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your {config.name.split(' ')[0]} Family! {config.emoji}
            </motion.button>
          </div>
        </motion.div>
      )}

      {phase !== 'intro' && (
        <div className="generic-game-container">
          <aside className="generic-sidebar">
            <AnimalPopulationStats 
              animals={animals}
              config={config}
              generation={generation}
              history={history}
              totalSurvived={totalSurvived}
              totalLost={totalLost}
            />
          </aside>

          <main className="generic-main-content">
            {message && (
              <motion.div 
                className="generic-message-banner"
                style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
                key={message}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {phase === 'select_event' && (
                <motion.div
                  key="environment-selector"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimalEnvironmentSelector 
                    config={config}
                    onSelectEvent={handleSelectEvent} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {(phase === 'survival' || phase === 'results' || phase === 'breeding') && currentEvent && (
              <motion.div 
                className="generic-event-banner"
                style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="generic-event-banner-emoji">{currentEvent.emoji}</span>
                <span className="generic-event-banner-text" style={{ color: theme.secondary }}>
                  {currentEvent.name}
                </span>
              </motion.div>
            )}

            <div className="generic-animals-section" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
              <h2 className="generic-section-title" style={{ color: theme.secondary }}>
                {phase === 'breeding' ? `🍼 New Baby ${config.name}!` : `${config.emoji} Your ${config.name}`}
              </h2>
              
              <div className="generic-animals-grid">
                <AnimatePresence mode="popLayout">
                  {aliveAnimals.map(animal => (
                    <AnimalCard
                      key={animal.id}
                      animal={animal}
                      config={config}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {deadAnimals.length > 0 && phase === 'results' && (
                <>
                  <h3 className="generic-section-subtitle" style={{ color: theme.secondary }}>
                    😇 {config.name} We Lost
                  </h3>
                  <div className="generic-animals-grid dead-animals">
                    <AnimatePresence>
                      {deadAnimals.map(animal => (
                        <AnimalCard
                          key={animal.id}
                          animal={animal}
                          config={config}
                          showDetails={true}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {phase === 'results' && (
              <motion.div 
                className="generic-results-actions"
                style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="generic-results-summary" style={{ color: theme.secondary }}>
                  {aliveAnimals.length} out of {animals.length} {config.plural} survived!
                  {aliveAnimals.length > 0 && " Now they'll have babies and pass on their traits!"}
                </p>
                <motion.button
                  className="generic-next-button"
                  style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
                  onClick={proceedToBreeding}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {aliveAnimals.length > 0 ? 'Time for Babies! 🍼' : 'Start Over'}
                </motion.button>
              </motion.div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default GenericAnimalApp;
