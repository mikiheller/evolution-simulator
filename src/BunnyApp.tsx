import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Bunny, EnvironmentEvent, PopulationStats as PopulationStatsType } from './types/bunny';
import { ENVIRONMENT_EVENTS } from './types/bunny';
import { createInitialPopulation, createOffspring, calculateAverageTraits, resetUsedNames } from './utils/bunnyUtils';
import { BunnyCard } from './components/BunnyCard';
import { PopulationStats } from './components/PopulationStats';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { Snowfall } from './components/Snowfall';
import './BunnyApp.css';

type GamePhase = 'intro' | 'select_event' | 'survival' | 'results' | 'breeding';

interface BunnyAppProps {
  onBack: () => void;
}

export function BunnyApp({ onBack }: BunnyAppProps) {
  const [bunnies, setBunnies] = useState<Bunny[]>([]);
  const [generation, setGeneration] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentEvent, setCurrentEvent] = useState<EnvironmentEvent | null>(null);
  const [history, setHistory] = useState<PopulationStatsType[]>([]);
  const [message, setMessage] = useState<string>('');
  const [totalSurvived, setTotalSurvived] = useState(0);
  const [totalLost, setTotalLost] = useState(0);
  const aliveBeforeSurvivalRef = useRef(0); // Track count before survival event
  const hasCountedRef = useRef(false); // Prevent double-counting

  // Calculate survival counts when results phase is reached
  useEffect(() => {
    if (phase === 'results' && !hasCountedRef.current) {
      hasCountedRef.current = true;
      const aliveAfter = bunnies.filter(b => b.isAlive).length;
      const aliveBefore = aliveBeforeSurvivalRef.current;
      const deaths = aliveBefore - aliveAfter;
      
      setTotalSurvived(prev => prev + aliveAfter);
      setTotalLost(prev => prev + deaths);
    }
  }, [phase, bunnies]);

  // Start the game
  const startGame = useCallback(() => {
    resetUsedNames(); // Reset name pool for new game
    const initialPopulation = createInitialPopulation(8);
    setBunnies(initialPopulation);
    setGeneration(1);
    setHistory([]);
    setTotalSurvived(0);
    setTotalLost(0);
    setPhase('select_event');
    setMessage('Meet your bunny family! Choose what challenge they will face this year.');
  }, []);

  // Handle environment event selection
  const handleSelectEvent = useCallback((eventId: EnvironmentEvent) => {
    setCurrentEvent(eventId);
    setPhase('survival');
    hasCountedRef.current = false; // Reset for new survival round
    
    const event = ENVIRONMENT_EVENTS.find(e => e.id === eventId)!;
    setMessage(`${event.emoji} ${event.name}! Let's see which bunnies survive...`);
    
    // Store alive count before survival
    aliveBeforeSurvivalRef.current = bunnies.filter(b => b.isAlive).length;
    
    // Apply survival logic after a short delay
    // TUNED FOR KIDS: Very strong, nearly deterministic selection!
    setTimeout(() => {
      setBunnies(currentBunnies => {
        return currentBunnies.map(bunny => {
          if (!bunny.isAlive) return bunny;
          
          // Get trait value (flip for "high is bad" events)
          let effectiveTrait = bunny.traits[event.dangerousTrait];
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
          
          return { ...bunny, isAlive: Math.random() < survivalChance };
        });
      });
      
      setTimeout(() => setPhase('results'), 1500);
    }, 1000);
  }, [bunnies]);

  // Proceed to breeding phase
  const proceedToBreeding = useCallback(() => {
    const aliveBunnies = bunnies.filter(b => b.isAlive);
    
    if (aliveBunnies.length === 0) {
      setMessage('Oh no! All the bunnies are gone. Let\'s start over with a new family.');
      setTimeout(() => setPhase('intro'), 2000);
      return;
    }
    
    // Save stats to history
    setHistory(prev => [...prev, {
      generation,
      averageTraits: calculateAverageTraits(aliveBunnies),
      populationSize: aliveBunnies.length,
      event: currentEvent || undefined
    }]);
    
    setPhase('breeding');
    setMessage('Time for baby bunnies! 🐰 Each bunny will have babies that are similar to them, but with some differences!');
    
    // Create next generation after a delay
    setTimeout(() => {
      const nextGeneration = generation + 1;
      const newBunnies: Bunny[] = [];
      
      // Each surviving bunny has 2-3 offspring
      aliveBunnies.forEach(parent => {
        const numOffspring = 2 + Math.floor(Math.random() * 2); // 2-3 offspring
        for (let i = 0; i < numOffspring; i++) {
          newBunnies.push(createOffspring(parent, nextGeneration));
        }
      });
      
      // Limit population to prevent it from getting too big
      const maxPopulation = 12;
      const finalBunnies = newBunnies.length > maxPopulation 
        ? newBunnies.sort(() => Math.random() - 0.5).slice(0, maxPopulation)
        : newBunnies;
      
      setBunnies(finalBunnies);
      setGeneration(nextGeneration);
      setCurrentEvent(null);
      
      setTimeout(() => {
        setPhase('select_event');
        setMessage(`Generation ${nextGeneration} is here! What challenge will they face?`);
      }, 1500);
    }, 2000);
  }, [bunnies, generation, currentEvent]);

  const aliveBunnies = bunnies.filter(b => b.isAlive);
  const deadBunnies = bunnies.filter(b => !b.isAlive);

  return (
    <div className="bunny-app">
      <Snowfall />
      
      <header className="bunny-app-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h1>🐰 Arctic Bunny Evolution 🐰</h1>
        <p className="bunny-subtitle">Watch natural selection in action!</p>
      </header>

      {phase === 'intro' && (
        <motion.div 
          className="bunny-intro-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bunny-intro-content">
            <div className="intro-bunny">🐇</div>
            <h2>Welcome to the Arctic!</h2>
            <p className="bunny-intro-tagline">
              Learn how animals change over time through <strong>evolution!</strong>
            </p>
            
            <div className="bunny-vocab-section">
              <h3>🧬 Key Words to Know</h3>
              
              <div className="bunny-vocab-grid">
                <div className="bunny-vocab-card">
                  <span className="bunny-vocab-emoji">🔄</span>
                  <span className="bunny-vocab-term">Evolution</span>
                  <span className="bunny-vocab-def">When a group of animals slowly changes over many, many generations</span>
                </div>
                
                <div className="bunny-vocab-card">
                  <span className="bunny-vocab-emoji">👨‍👩‍👧</span>
                  <span className="bunny-vocab-term">Inheritance</span>
                  <span className="bunny-vocab-def">Babies get traits from their parents - like fur color or how fast they can run!</span>
                </div>
                
                <div className="bunny-vocab-card">
                  <span className="bunny-vocab-emoji">🎲</span>
                  <span className="bunny-vocab-term">Variation</span>
                  <span className="bunny-vocab-def">Not every bunny is the same! Some are faster, some have thicker fur</span>
                </div>
                
                <div className="bunny-vocab-card">
                  <span className="bunny-vocab-emoji">🎯</span>
                  <span className="bunny-vocab-term">Selection</span>
                  <span className="bunny-vocab-def">Nature "picks" which animals survive based on their traits and the environment</span>
                </div>
                
                <div className="bunny-vocab-card">
                  <span className="bunny-vocab-emoji">🦎</span>
                  <span className="bunny-vocab-term">Adaptation</span>
                  <span className="bunny-vocab-def">A trait that helps a bunny survive - like white fur to hide in the snow!</span>
                </div>
                
                <div className="bunny-vocab-card">
                  <span className="bunny-vocab-emoji">💪</span>
                  <span className="bunny-vocab-term">Survival of the Fittest</span>
                  <span className="bunny-vocab-def">Bunnies with the best traits for their environment survive and have more babies!</span>
                </div>
              </div>
            </div>
            
            <motion.button 
              className="bunny-start-button"
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Bunny Family! 🐰
            </motion.button>
          </div>
        </motion.div>
      )}

      {phase !== 'intro' && (
        <div className="bunny-game-container">
          <aside className="bunny-sidebar">
            <PopulationStats 
              bunnies={bunnies} 
              generation={generation}
              history={history}
              totalSurvived={totalSurvived}
              totalLost={totalLost}
            />
          </aside>

          <main className="bunny-main-content">
            {message && (
              <motion.div 
                className="bunny-message-banner"
                key={message}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {phase === 'select_event' && (
              <EnvironmentSelector onSelectEvent={handleSelectEvent} />
            )}

            {(phase === 'survival' || phase === 'results' || phase === 'breeding') && currentEvent && (
              <motion.div 
                className="bunny-event-banner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="bunny-event-banner-emoji">
                  {ENVIRONMENT_EVENTS.find(e => e.id === currentEvent)?.emoji}
                </span>
                <span className="bunny-event-banner-text">
                  {ENVIRONMENT_EVENTS.find(e => e.id === currentEvent)?.name}
                </span>
              </motion.div>
            )}

            <div className="bunnies-section">
              <h2 className="bunny-section-title">
                {phase === 'breeding' ? '🍼 New Baby Bunnies!' : '🐰 Your Bunny Family'}
              </h2>
              
              <div className="bunnies-grid">
                <AnimatePresence mode="popLayout">
                  {aliveBunnies.map(bunny => (
                    <BunnyCard
                      key={bunny.id}
                      bunny={bunny}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {deadBunnies.length > 0 && phase === 'results' && (
                <>
                  <h3 className="bunny-section-subtitle">😇 Bunnies We Lost</h3>
                  <div className="bunnies-grid dead-bunnies">
                    <AnimatePresence>
                      {deadBunnies.map(bunny => (
                        <BunnyCard
                          key={bunny.id}
                          bunny={bunny}
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
                className="bunny-results-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="bunny-results-summary">
                  {aliveBunnies.length} out of {bunnies.length} bunnies survived!
                  {aliveBunnies.length > 0 && " Now they'll have babies and pass on their traits!"}
                </p>
                <motion.button
                  className="bunny-next-button"
                  onClick={proceedToBreeding}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {aliveBunnies.length > 0 ? 'Time for Babies! 🍼' : 'Start Over'}
                </motion.button>
              </motion.div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default BunnyApp;
