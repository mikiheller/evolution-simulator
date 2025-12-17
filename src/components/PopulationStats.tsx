import { motion } from 'framer-motion';
import type { Bunny, PopulationStats as PopulationStatsType } from '../types/bunny';
import { calculateAverageTraits, getTraitEmoji, getTraitName, getTraitRating } from '../utils/bunnyUtils';
import './PopulationStats.css';

interface PopulationStatsProps {
  bunnies: Bunny[];
  generation: number;
  history: PopulationStatsType[];
  totalLost: number;
}

// Trait colors for the line chart
const TRAIT_COLORS = {
  furThickness: '#60a5fa', // blue
  speed: '#fbbf24',        // yellow
  size: '#34d399',         // green
  camouflage: '#f472b6'    // pink
};

export function PopulationStats({ bunnies, generation, history, totalLost }: PopulationStatsProps) {
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

  // Calculate total bunnies that have ever lived
  const totalBorn = aliveBunnies.length + totalLost;
  const survivalRate = totalBorn > 0 ? Math.round((aliveBunnies.length / totalBorn) * 100) : 100;
  
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
          <span className="stat-icon">🐣</span>
          <span className="stat-value">{totalBorn}</span>
          <span className="stat-label">Total Born</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">😇</span>
          <span className="stat-value">{totalLost}</span>
          <span className="stat-label">Total Lost</span>
        </div>
      </div>
      
      <div className="survival-rate">
        <div className="rate-label">
          <span>Survival Rate</span>
          <span className={`rate-value ${survivalRate >= 50 ? 'good' : 'poor'}`}>{survivalRate}%</span>
        </div>
        <div className="rate-bar">
          <motion.div 
            className={`rate-fill ${survivalRate >= 50 ? 'good' : 'poor'}`}
            initial={{ width: 0 }}
            animate={{ width: `${survivalRate}%` }}
            transition={{ duration: 0.8 }}
          />
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
          
          {/* Compact horizontal mini-bars */}
          <div className="history-grid-compact">
            {history.map((stats, i) => (
              <div key={i} className="history-bar-group-compact">
                <div className="history-mini-bars">
                  {traits.map(trait => (
                    <div 
                      key={trait}
                      className="history-mini-bar"
                      style={{ 
                        width: `${stats.averageTraits[trait]}%`,
                        backgroundColor: TRAIT_COLORS[trait]
                      }}
                      title={`${getTraitName(trait)}: ${stats.averageTraits[trait]}`}
                    />
                  ))}
                </div>
                <span className="history-label-compact">Gen {stats.generation}</span>
              </div>
            ))}
          </div>
          
          {/* Line chart */}
          {history.length >= 2 && (
            <div className="line-chart-container">
              <h4>📊 Trait Trends</h4>
              <div className="line-chart">
                <svg viewBox="0 0 300 150" className="chart-svg">
                  {/* Grid lines */}
                  <line x1="40" y1="10" x2="40" y2="120" stroke="rgba(255,255,255,0.2)" />
                  <line x1="40" y1="120" x2="290" y2="120" stroke="rgba(255,255,255,0.2)" />
                  <line x1="40" y1="65" x2="290" y2="65" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
                  <line x1="40" y1="10" x2="290" y2="10" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
                  
                  {/* Y-axis labels */}
                  <text x="35" y="123" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end">0</text>
                  <text x="35" y="68" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end">50</text>
                  <text x="35" y="14" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end">100</text>
                  
                  {/* Lines for each trait */}
                  {traits.map(trait => {
                    const points = history.map((stats, i) => {
                      const x = 40 + (i / (history.length - 1)) * 250;
                      const y = 120 - (stats.averageTraits[trait] / 100) * 110;
                      return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                      <polyline
                        key={trait}
                        points={points}
                        fill="none"
                        stroke={TRAIT_COLORS[trait]}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  })}
                  
                  {/* Dots at each data point */}
                  {traits.map(trait => (
                    history.map((stats, i) => {
                      const x = 40 + (i / (history.length - 1)) * 250;
                      const y = 120 - (stats.averageTraits[trait] / 100) * 110;
                      return (
                        <circle
                          key={`${trait}-${i}`}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={TRAIT_COLORS[trait]}
                        />
                      );
                    })
                  ))}
                  
                  {/* X-axis generation labels */}
                  {history.map((stats, i) => {
                    const x = 40 + (i / (history.length - 1)) * 250;
                    return (
                      <text
                        key={i}
                        x={x}
                        y="135"
                        fill="rgba(255,255,255,0.6)"
                        fontSize="8"
                        textAnchor="middle"
                      >
                        {stats.generation}
                      </text>
                    );
                  })}
                </svg>
              </div>
              
              {/* Legend */}
              <div className="chart-legend">
                {traits.map(trait => (
                  <div key={trait} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: TRAIT_COLORS[trait] }} />
                    <span className="legend-label">{getTraitEmoji(trait)} {getTraitName(trait)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
