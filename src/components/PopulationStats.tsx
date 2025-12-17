import { motion } from 'framer-motion';
import type { Bunny, PopulationStats as PopulationStatsType } from '../types/bunny';
import { calculateAverageTraits, getTraitEmoji, getTraitName, getTraitRating } from '../utils/bunnyUtils';
import './PopulationStats.css';

interface PopulationStatsProps {
  bunnies: Bunny[];
  generation: number;
  history: PopulationStatsType[];
}

export function PopulationStats({ bunnies, generation, history }: PopulationStatsProps) {
  const aliveBunnies = bunnies.filter(b => b.isAlive);
  const averageTraits = calculateAverageTraits(aliveBunnies);
  
  const traits = ['furThickness', 'speed', 'size', 'camouflage'] as const;
  
  // Get previous generation's averages for comparison
  const previousStats = history.length > 0 ? history[history.length - 1] : null;
  
  const getChangeIndicator = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 2) return null;
    return diff > 0 ? (
      <span className="change-indicator up">↑{diff}</span>
    ) : (
      <span className="change-indicator down">↓{Math.abs(diff)}</span>
    );
  };
  
  return (
    <motion.div 
      className="population-stats"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="stats-header">
        <h2>🐰 Population Stats</h2>
        <div className="generation-badge">
          <span className="gen-label">Generation</span>
          <span className="gen-number">{generation}</span>
        </div>
      </div>
      
      <div className="stats-overview">
        <div className="stat-item">
          <span className="stat-icon">🐇</span>
          <span className="stat-value">{aliveBunnies.length}</span>
          <span className="stat-label">Alive</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">😇</span>
          <span className="stat-value">{bunnies.length - aliveBunnies.length}</span>
          <span className="stat-label">Lost</span>
        </div>
      </div>
      
      <div className="average-traits">
        <h3>Average Traits</h3>
        <p className="traits-explanation">
          These numbers show what the "typical" bunny looks like now!
        </p>
        
        {traits.map(trait => {
          const value = averageTraits[trait];
          const rating = getTraitRating(value);
          const previousValue = previousStats?.averageTraits[trait];
          
          return (
            <div key={trait} className="average-trait">
              <div className="trait-header">
                <span className="trait-icon">{getTraitEmoji(trait)}</span>
                <span className="trait-title">{getTraitName(trait)}</span>
                {getChangeIndicator(value, previousValue)}
              </div>
              <div className="trait-bar-container">
                <motion.div 
                  className="trait-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ backgroundColor: rating.color }}
                />
                <div className="trait-markers">
                  {[0, 25, 50, 75, 100].map(mark => (
                    <div key={mark} className="marker" style={{ left: `${mark}%` }} />
                  ))}
                </div>
              </div>
              <div className="trait-info">
                <span className="trait-value" style={{ color: rating.color }}>{value}</span>
                <span className="trait-rating" style={{ color: rating.color }}>{rating.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {history.length > 0 && (
        <div className="evolution-history">
          <h3>📈 Evolution Over Time</h3>
          <div className="history-chart">
            {history.map((stats, i) => (
              <div key={i} className="history-bar-group">
                <div className="history-bars">
                  {traits.map(trait => (
                    <div 
                      key={trait}
                      className="history-bar"
                      style={{ 
                        height: `${stats.averageTraits[trait]}%`,
                        backgroundColor: getTraitRating(stats.averageTraits[trait]).color
                      }}
                      title={`${getTraitName(trait)}: ${stats.averageTraits[trait]}`}
                    />
                  ))}
                </div>
                <span className="history-label">Gen {stats.generation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

