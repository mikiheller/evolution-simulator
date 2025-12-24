import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Elephant, ElephantEnvironmentEvent, ElephantPopulationStats as ElephantPopulationStatsType } from './types/elephant';
import { ELEPHANT_ENVIRONMENT_EVENTS } from './types/elephant';
import { createInitialElephantPopulation, createElephantOffspring, calculateAverageElephantTraits, resetUsedElephantNames } from './utils/elephantUtils';
import { ElephantCard } from './components/ElephantCard';
import { ElephantPopulationStats } from './components/ElephantPopulationStats';
import { ElephantEnvironmentSelector } from './components/ElephantEnvironmentSelector';
import { SavannaDust } from './components/SavannaDust';
import './ElephantApp.css';

type GamePhase = 'intro' | 'select_event' | 'survival' | 'results' | 'breeding';

interface ElephantAppProps {
  onBack: () => void;
}

export function ElephantApp({ onBack }: ElephantAppProps) {
  const [elephants, setElephants] = useState<Elephant[]>([]);
  const [generation, setGeneration] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentEvent, setCurrentEvent] = useState<ElephantEnvironmentEvent | null>(null);
  const [history, setHistory] = useState<ElephantPopulationStatsType[]>([]);
  const [message, setMessage] = useState<string>('');
  const [totalSurvived, setTotalSurvived] = useState(0);
  const [totalLost, setTotalLost] = useState(0);
  const aliveBeforeSurvivalRef = useRef(0); // Track count before survival event
  const hasCountedRef = useRef(false); // Prevent double-counting

  // Calculate survival counts when results phase is reached
  useEffect(() => {
    if (phase === 'results' && !hasCountedRef.current) {
      hasCountedRef.current = true;
      const aliveAfter = elephants.filter(e => e.isAlive).length;
      const aliveBefore = aliveBeforeSurvivalRef.current;
      const deaths = aliveBefore - aliveAfter;
      
      setTotalSurvived(prev => prev + aliveAfter);
      setTotalLost(prev => prev + deaths);
    }
  }, [phase, elephants]);

  // Start the game
  const startGame = useCallback(() => {
    resetUsedElephantNames(); // Reset name pool for new game
    const initialPopulation = createInitialElephantPopulation(8);
    setElephants(initialPopulation);
    setGeneration(1);
    setHistory([]);
    setTotalSurvived(0);
    setTotalLost(0);
    setPhase('select_event');
    setMessage('Meet your elephant herd! Choose what challenge they will face this year.');
  }, []);

  // Handle environment event selection
  const handleSelectEvent = useCallback((eventId: ElephantEnvironmentEvent) => {
    setCurrentEvent(eventId);
    setPhase('survival');
    hasCountedRef.current = false; // Reset for new survival round
    
    const event = ELEPHANT_ENVIRONMENT_EVENTS.find(e => e.id === eventId)!;
    setMessage(`${event.emoji} ${event.name}! Let's see which elephants survive...`);
    
    // Store alive count before survival
    aliveBeforeSurvivalRef.current = elephants.filter(e => e.isAlive).length;
    
    // Apply survival logic after a short delay
    // TUNED FOR KIDS: Very strong, nearly deterministic selection!
    setTimeout(() => {
      setElephants(currentElephants => {
        return currentElephants.map(elephant => {
          if (!elephant.isAlive) return elephant;
          
          // Get trait value (flip for "high is bad" events)
          let effectiveTrait = elephant.traits[event.dangerousTrait];
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
          
          return { ...elephant, isAlive: Math.random() < survivalChance };
        });
      });
      
      setTimeout(() => setPhase('results'), 1500);
    }, 1000);
  }, [elephants]);

  // Proceed to breeding phase
  const proceedToBreeding = useCallback(() => {
    const aliveElephants = elephants.filter(e => e.isAlive);
    
    if (aliveElephants.length === 0) {
      setMessage('Oh no! The whole herd is gone. Let\'s start over with a new family.');
      setTimeout(() => setPhase('intro'), 2000);
      return;
    }
    
    // Save stats to history
    setHistory(prev => [...prev, {
      generation,
      averageTraits: calculateAverageElephantTraits(aliveElephants),
      populationSize: aliveElephants.length,
      event: currentEvent || undefined
    }]);
    
    setPhase('breeding');
    setMessage('Time for baby elephants! 🐘 Each elephant will have calves that are similar to them, but with some differences!');
    
    // Create next generation after a delay
    setTimeout(() => {
      const nextGeneration = generation + 1;
      const newElephants: Elephant[] = [];
      
      // Each surviving elephant has 1-2 offspring (elephants have fewer babies than bunnies!)
      aliveElephants.forEach(parent => {
        const numOffspring = 1 + Math.floor(Math.random() * 2); // 1-2 offspring
        for (let i = 0; i < numOffspring; i++) {
          newElephants.push(createElephantOffspring(parent, nextGeneration));
        }
      });
      
      // Limit population to prevent it from getting too big
      const maxPopulation = 10;
      const finalElephants = newElephants.length > maxPopulation 
        ? newElephants.sort(() => Math.random() - 0.5).slice(0, maxPopulation)
        : newElephants;
      
      setElephants(finalElephants);
      setGeneration(nextGeneration);
      setCurrentEvent(null);
      
      setTimeout(() => {
        setPhase('select_event');
        setMessage(`Generation ${nextGeneration} is here! What challenge will they face?`);
      }, 1500);
    }, 2000);
  }, [elephants, generation, currentEvent]);

  const aliveElephants = elephants.filter(e => e.isAlive);
  const deadElephants = elephants.filter(e => !e.isAlive);

  return (
    <div className="elephant-app">
      <SavannaDust />
      
      <header className="elephant-app-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h1>🐘 African Elephant Evolution 🐘</h1>
        <p className="elephant-subtitle">Watch natural selection in action!</p>
      </header>

      {phase === 'intro' && (
        <motion.div 
          className="elephant-intro-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="elephant-intro-content">
            <div className="intro-elephant">🐘</div>
            <h2>Welcome to the Savanna!</h2>
            <p className="elephant-intro-tagline">
              Learn how elephants change over time through <strong>evolution!</strong>
            </p>
            
            <div className="elephant-vocab-section">
              <h3>🧬 Key Words to Know</h3>
              
              <div className="elephant-vocab-grid">
                <div className="elephant-vocab-card">
                  <span className="elephant-vocab-emoji">🔄</span>
                  <span className="elephant-vocab-term">Evolution</span>
                  <span className="elephant-vocab-def">When a group of animals slowly changes over many, many generations</span>
                </div>
                
                <div className="elephant-vocab-card">
                  <span className="elephant-vocab-emoji">👨‍👩‍👧</span>
                  <span className="elephant-vocab-term">Inheritance</span>
                  <span className="elephant-vocab-def">Baby elephants get traits from their parents - like tusk size or how good their memory is!</span>
                </div>
                
                <div className="elephant-vocab-card">
                  <span className="elephant-vocab-emoji">🎲</span>
                  <span className="elephant-vocab-term">Variation</span>
                  <span className="elephant-vocab-def">Not every elephant is the same! Some have bigger tusks, some have better memory</span>
                </div>
                
                <div className="elephant-vocab-card">
                  <span className="elephant-vocab-emoji">🎯</span>
                  <span className="elephant-vocab-term">Selection</span>
                  <span className="elephant-vocab-def">Nature "picks" which animals survive based on their traits and the environment</span>
                </div>
                
                <div className="elephant-vocab-card">
                  <span className="elephant-vocab-emoji">🦎</span>
                  <span className="elephant-vocab-term">Adaptation</span>
                  <span className="elephant-vocab-def">The process where species develop traits that help them survive better in their environment</span>
                </div>
                
                <div className="elephant-vocab-card">
                  <span className="elephant-vocab-emoji">💪</span>
                  <span className="elephant-vocab-term">Survival of the Fittest</span>
                  <span className="elephant-vocab-def">Elephants with the best traits for their environment survive and have more babies!</span>
                </div>
              </div>
            </div>
            
            <motion.button 
              className="elephant-start-button"
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Elephant Herd! 🐘
            </motion.button>
          </div>
        </motion.div>
      )}

      {phase !== 'intro' && (
        <div className="elephant-game-container">
          <aside className="elephant-sidebar">
            <ElephantPopulationStats 
              elephants={elephants} 
              generation={generation}
              history={history}
              totalSurvived={totalSurvived}
              totalLost={totalLost}
            />
          </aside>

          <main className="elephant-main-content">
            {message && (
              <motion.div 
                className="elephant-message-banner"
                key={message}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {phase === 'select_event' && (
              <ElephantEnvironmentSelector onSelectEvent={handleSelectEvent} />
            )}

            {(phase === 'survival' || phase === 'results' || phase === 'breeding') && currentEvent && (
              <motion.div 
                className="elephant-event-banner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="elephant-event-banner-emoji">
                  {ELEPHANT_ENVIRONMENT_EVENTS.find(e => e.id === currentEvent)?.emoji}
                </span>
                <span className="elephant-event-banner-text">
                  {ELEPHANT_ENVIRONMENT_EVENTS.find(e => e.id === currentEvent)?.name}
                </span>
              </motion.div>
            )}

            <div className="elephants-section">
              <h2 className="elephant-section-title">
                {phase === 'breeding' ? '🍼 New Baby Elephants!' : '🐘 Your Elephant Herd'}
              </h2>
              
              <div className="elephants-grid">
                <AnimatePresence mode="popLayout">
                  {aliveElephants.map(elephant => (
                    <ElephantCard
                      key={elephant.id}
                      elephant={elephant}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {deadElephants.length > 0 && phase === 'results' && (
                <>
                  <h3 className="elephant-section-subtitle">😇 Elephants We Lost</h3>
                  <div className="elephants-grid dead-elephants">
                    <AnimatePresence>
                      {deadElephants.map(elephant => (
                        <ElephantCard
                          key={elephant.id}
                          elephant={elephant}
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
                className="elephant-results-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="elephant-results-summary">
                  {aliveElephants.length} out of {elephants.length} elephants survived!
                  {aliveElephants.length > 0 && " Now they'll have calves and pass on their traits!"}
                </p>
                <motion.button
                  className="elephant-next-button"
                  onClick={proceedToBreeding}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {aliveElephants.length > 0 ? 'Time for Calves! 🍼' : 'Start Over'}
                </motion.button>
              </motion.div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default ElephantApp;
