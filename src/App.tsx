import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Bunny, EnvironmentEvent, PopulationStats as PopulationStatsType } from './types/bunny';
import { ENVIRONMENT_EVENTS } from './types/bunny';
import { createInitialPopulation, createOffspring, calculateAverageTraits } from './utils/bunnyUtils';
import { BunnyCard } from './components/BunnyCard';
import { PopulationStats } from './components/PopulationStats';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { Snowfall } from './components/Snowfall';
import './App.css';

type GamePhase = 'intro' | 'select_event' | 'survival' | 'results' | 'breeding';

function App() {
  const [bunnies, setBunnies] = useState<Bunny[]>([]);
  const [generation, setGeneration] = useState(1);
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentEvent, setCurrentEvent] = useState<EnvironmentEvent | null>(null);
  const [history, setHistory] = useState<PopulationStatsType[]>([]);
  const [message, setMessage] = useState<string>('');
  const [totalLost, setTotalLost] = useState(0);

  // Start the game
  const startGame = useCallback(() => {
    const initialPopulation = createInitialPopulation(8);
    setBunnies(initialPopulation);
    setGeneration(1);
    setHistory([]);
    setTotalLost(0);
    setPhase('select_event');
    setMessage('Meet your bunny family! Choose what challenge they will face this year.');
  }, []);

  // Handle environment event selection
  const handleSelectEvent = useCallback((eventId: EnvironmentEvent) => {
    setCurrentEvent(eventId);
    setPhase('survival');
    
    const event = ENVIRONMENT_EVENTS.find(e => e.id === eventId)!;
    setMessage(`${event.emoji} ${event.name}! Let's see which bunnies survive...`);
    
    // Apply survival logic after a short delay
    // TUNED FOR KIDS: Very strong, nearly deterministic selection!
    setTimeout(() => {
      setBunnies(currentBunnies => {
        const updatedBunnies = currentBunnies.map(bunny => {
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
        
        // Count deaths and update total
        const deaths = updatedBunnies.filter(b => !b.isAlive).length - currentBunnies.filter(b => !b.isAlive).length;
        if (deaths > 0) {
          setTotalLost(prev => prev + deaths);
        }
        
        return updatedBunnies;
      });
      
      setTimeout(() => setPhase('results'), 1500);
    }, 1000);
  }, []);

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
    <div className="app">
      <Snowfall />
      
      <header className="app-header">
        <h1>🐰 Arctic Bunny Evolution 🐰</h1>
        <p className="subtitle">Watch natural selection in action!</p>
      </header>

      {phase === 'intro' && (
        <motion.div 
          className="intro-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="intro-content">
            <div className="intro-bunny">🐇</div>
            <h2>Welcome to the Arctic!</h2>
            <p>
              In this game, you'll see how bunnies <strong>evolve</strong> over time!
            </p>
            <p>
              Each bunny has special traits like thick fur, speed, and camouflage.
              When tough times come, bunnies with the right traits survive and have babies.
            </p>
            <p>
              Over many generations, the bunny family changes - this is called <strong>evolution by natural selection!</strong>
            </p>
            <motion.button 
              className="start-button"
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
        <div className="game-container">
          <aside className="sidebar">
            <PopulationStats 
              bunnies={bunnies} 
              generation={generation}
              history={history}
              totalLost={totalLost}
            />
          </aside>

          <main className="main-content">
            {message && (
              <motion.div 
                className="message-banner"
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
                className="event-banner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="event-banner-emoji">
                  {ENVIRONMENT_EVENTS.find(e => e.id === currentEvent)?.emoji}
                </span>
                <span className="event-banner-text">
                  {ENVIRONMENT_EVENTS.find(e => e.id === currentEvent)?.name}
                </span>
              </motion.div>
            )}

            <div className="bunnies-section">
              <h2 className="section-title">
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
                  <h3 className="section-subtitle">😇 Bunnies We Lost</h3>
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
                className="results-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="results-summary">
                  {aliveBunnies.length} out of {bunnies.length} bunnies survived!
                  {aliveBunnies.length > 0 && " Now they'll have babies and pass on their traits!"}
                </p>
                <motion.button
                  className="next-button"
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

export default App;
