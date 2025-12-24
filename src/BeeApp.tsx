import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Bee, BeeEnvironmentEvent, BeePopulationStats as BeePopulationStatsType } from './types/bee';
import { BEE_ENVIRONMENT_EVENTS } from './types/bee';
import { createInitialPopulation, createOffspring, calculateAverageTraits, resetUsedNames } from './utils/beeUtils';
import { BeeCard } from './components/BeeCard';
import { BeePopulationStats } from './components/BeePopulationStats';
import { BeeEnvironmentSelector } from './components/BeeEnvironmentSelector';
import './BeeApp.css';

type GamePhase = 'intro' | 'select_event' | 'survival' | 'results' | 'breeding';

interface BeeAppProps {
  onBack: () => void;
}

export function BeeApp({ onBack }: BeeAppProps) {
  const [bees, setBees] = useState<Bee[]>([]);
  const [generation, setGeneration] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentEvent, setCurrentEvent] = useState<BeeEnvironmentEvent | null>(null);
  const [history, setHistory] = useState<BeePopulationStatsType[]>([]);
  const [message, setMessage] = useState<string>('');
  const [totalSurvived, setTotalSurvived] = useState(0);
  const [totalLost, setTotalLost] = useState(0);
  const aliveBeforeSurvivalRef = useRef(0); // Track count before survival event
  const hasCountedRef = useRef(false); // Prevent double-counting

  // Calculate survival counts when results phase is reached
  useEffect(() => {
    if (phase === 'results' && !hasCountedRef.current) {
      hasCountedRef.current = true;
      const aliveAfter = bees.filter(b => b.isAlive).length;
      const aliveBefore = aliveBeforeSurvivalRef.current;
      const deaths = aliveBefore - aliveAfter;
      
      setTotalSurvived(prev => prev + aliveAfter);
      setTotalLost(prev => prev + deaths);
    }
  }, [phase, bees]);

  // Start the game
  const startGame = useCallback(() => {
    resetUsedNames(); // Reset name pool for new game
    const initialPopulation = createInitialPopulation(8);
    setBees(initialPopulation);
    setGeneration(1);
    setHistory([]);
    setTotalSurvived(0);
    setTotalLost(0);
    setPhase('select_event');
    setMessage('Meet your bee colony! Choose what challenge they will face this season.');
  }, []);

  // Handle environment event selection
  const handleSelectEvent = useCallback((eventId: BeeEnvironmentEvent) => {
    setCurrentEvent(eventId);
    setPhase('survival');
    hasCountedRef.current = false; // Reset for new survival round
    
    const event = BEE_ENVIRONMENT_EVENTS.find(e => e.id === eventId)!;
    setMessage(`${event.emoji} ${event.name}! Let's see which bees survive...`);
    
    // Store alive count before survival
    aliveBeforeSurvivalRef.current = bees.filter(b => b.isAlive).length;
    
    // Apply survival logic after a short delay
    // TUNED FOR KIDS: Very strong, nearly deterministic selection!
    setTimeout(() => {
      setBees(currentBees => {
        return currentBees.map(bee => {
          if (!bee.isAlive) return bee;
          
          // Get trait value (flip for "high is bad" events)
          let effectiveTrait = bee.traits[event.dangerousTrait];
          if (event.traitDirection === 'high') {
            effectiveTrait = 100 - effectiveTrait;
          }
          
          // VERY STRONG SELECTION using sigmoid curve
          // This creates a sharp cutoff around trait value 50
          // Below 30: almost certain death
          // Above 70: almost certain survival
          // The steepness (0.15) controls how sharp the cutoff is
          const sigmoid = 1 / (1 + Math.exp(-0.15 * (effectiveTrait - 50)));
          
          // Scale to range: 2% survival at bottom, 98% at top
          const survivalChance = 0.02 + sigmoid * 0.96;
          
          return { ...bee, isAlive: Math.random() < survivalChance };
        });
      });
      
      setTimeout(() => setPhase('results'), 1500);
    }, 1000);
  }, [bees]);

  // Proceed to breeding phase
  const proceedToBreeding = useCallback(() => {
    const aliveBees = bees.filter(b => b.isAlive);
    
    if (aliveBees.length === 0) {
      setMessage('Oh no! All the bees are gone. Let\'s start over with a new colony.');
      setTimeout(() => setPhase('intro'), 2000);
      return;
    }
    
    // Save stats to history
    setHistory(prev => [...prev, {
      generation,
      averageTraits: calculateAverageTraits(aliveBees),
      populationSize: aliveBees.length,
      event: currentEvent || undefined
    }]);
    
    setPhase('breeding');
    setMessage('Time for baby bees! 🐝 Each bee will have babies that are similar to them, but with some differences!');
    
    // Create next generation after a delay
    setTimeout(() => {
      const nextGeneration = generation + 1;
      const newBees: Bee[] = [];
      
      // Each surviving bee has 2-3 offspring
      aliveBees.forEach(parent => {
        const numOffspring = 2 + Math.floor(Math.random() * 2); // 2-3 offspring
        for (let i = 0; i < numOffspring; i++) {
          newBees.push(createOffspring(parent, nextGeneration));
        }
      });
      
      // Limit population to prevent it from getting too big
      const maxPopulation = 12;
      const finalBees = newBees.length > maxPopulation 
        ? newBees.sort(() => Math.random() - 0.5).slice(0, maxPopulation)
        : newBees;
      
      setBees(finalBees);
      setGeneration(nextGeneration);
      setCurrentEvent(null);
      
      setTimeout(() => {
        setPhase('select_event');
        setMessage(`Generation ${nextGeneration} is here! What challenge will they face?`);
      }, 1500);
    }, 2000);
  }, [bees, generation, currentEvent]);

  const aliveBees = bees.filter(b => b.isAlive);
  const deadBees = bees.filter(b => !b.isAlive);

  return (
    <div className="bee-app">
      {/* Floating honeycomb background */}
      <div className="honeycomb-bg" />
      
      <header className="bee-app-header">
        <button className="bee-back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h1>🐝 Busy Bee Evolution 🐝</h1>
        <p className="bee-subtitle">Watch natural selection in the hive!</p>
      </header>

      {phase === 'intro' && (
        <motion.div 
          className="bee-intro-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bee-intro-content">
            <div className="intro-bee">🐝</div>
            <h2>Welcome to the Hive!</h2>
            <p className="bee-intro-tagline">
              Learn how bees change over time through <strong>evolution!</strong>
            </p>
            
            <div className="bee-vocab-section">
              <h3>🧬 Key Words to Know</h3>
              
              <div className="bee-vocab-grid">
                <div className="bee-vocab-card">
                  <span className="bee-vocab-emoji">🔄</span>
                  <span className="bee-vocab-term">Evolution</span>
                  <span className="bee-vocab-def">When a group of animals slowly changes over many, many generations</span>
                </div>
                
                <div className="bee-vocab-card">
                  <span className="bee-vocab-emoji">👨‍👩‍👧</span>
                  <span className="bee-vocab-term">Inheritance</span>
                  <span className="bee-vocab-def">Baby bees get traits from their parents - like dancing skills or navigation!</span>
                </div>
                
                <div className="bee-vocab-card">
                  <span className="bee-vocab-emoji">🎲</span>
                  <span className="bee-vocab-term">Variation</span>
                  <span className="bee-vocab-def">Not every bee is the same! Some are better dancers, some carry more pollen</span>
                </div>
                
                <div className="bee-vocab-card">
                  <span className="bee-vocab-emoji">🎯</span>
                  <span className="bee-vocab-term">Selection</span>
                  <span className="bee-vocab-def">Nature "picks" which bees survive based on their traits and the environment</span>
                </div>
                
                <div className="bee-vocab-card">
                  <span className="bee-vocab-emoji">🦎</span>
                  <span className="bee-vocab-term">Adaptation</span>
                  <span className="bee-vocab-def">The process where species develop traits that help them survive better in their environment</span>
                </div>
                
                <div className="bee-vocab-card">
                  <span className="bee-vocab-emoji">💪</span>
                  <span className="bee-vocab-term">Survival of the Fittest</span>
                  <span className="bee-vocab-def">Bees with the best traits for their environment survive and have more babies!</span>
                </div>
              </div>
            </div>
            
            <motion.button 
              className="bee-start-button"
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Bee Colony! 🐝
            </motion.button>
          </div>
        </motion.div>
      )}

      {phase !== 'intro' && (
        <div className="bee-game-container">
          <aside className="bee-sidebar">
            <BeePopulationStats 
              bees={bees} 
              generation={generation}
              history={history}
              totalSurvived={totalSurvived}
              totalLost={totalLost}
            />
          </aside>

          <main className="bee-main-content">
            {message && (
              <motion.div 
                className="bee-message-banner"
                key={message}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {phase === 'select_event' && (
              <BeeEnvironmentSelector onSelectEvent={handleSelectEvent} />
            )}

            {(phase === 'survival' || phase === 'results' || phase === 'breeding') && currentEvent && (
              <motion.div 
                className="bee-event-banner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="bee-event-banner-emoji">
                  {BEE_ENVIRONMENT_EVENTS.find(e => e.id === currentEvent)?.emoji}
                </span>
                <span className="bee-event-banner-text">
                  {BEE_ENVIRONMENT_EVENTS.find(e => e.id === currentEvent)?.name}
                </span>
              </motion.div>
            )}

            <div className="bees-section">
              <h2 className="bee-section-title">
                {phase === 'breeding' ? '🍼 New Baby Bees!' : '🐝 Your Bee Colony'}
              </h2>
              
              <div className="bees-grid">
                <AnimatePresence mode="popLayout">
                  {aliveBees.map(bee => (
                    <BeeCard
                      key={bee.id}
                      bee={bee}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {deadBees.length > 0 && phase === 'results' && (
                <>
                  <h3 className="bee-section-subtitle">😇 Bees We Lost</h3>
                  <div className="bees-grid dead-bees">
                    <AnimatePresence>
                      {deadBees.map(bee => (
                        <BeeCard
                          key={bee.id}
                          bee={bee}
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
                className="bee-results-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="bee-results-summary">
                  {aliveBees.length} out of {bees.length} bees survived!
                  {aliveBees.length > 0 && " Now they'll have babies and pass on their traits!"}
                </p>
                <motion.button
                  className="bee-next-button"
                  onClick={proceedToBreeding}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {aliveBees.length > 0 ? 'Time for Babies! 🍼' : 'Start Over'}
                </motion.button>
              </motion.div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default BeeApp;
