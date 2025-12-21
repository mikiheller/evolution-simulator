import { motion } from 'framer-motion';
import type { Bee, BeePopulationStats as BeePopulationStatsType } from '../types/bee';
import { BEE_ENVIRONMENT_EVENTS } from '../types/bee';
import { calculateAverageTraits, getTraitEmoji, getTraitName, getTraitRating } from '../utils/beeUtils';
import './BeePopulationStats.css';

// Get emoji for an event
function getEventEmoji(eventId: string | undefined): string {
  if (!eventId) return '';
  const event = BEE_ENVIRONMENT_EVENTS.find(e => e.id === eventId);
  return event?.emoji || '';
}

interface BeePopulationStatsProps {
  bees: Bee[];
  generation: number;
  history: BeePopulationStatsType[];
  totalSurvived: number;
  totalLost: number;
}

// Trait colors for the line chart
const TRAIT_COLORS = {
  waggleDance: '#f472b6', // pink
  pollenCapacity: '#fbbf24', // yellow/gold
  navigation: '#60a5fa', // blue
  stingDefense: '#ef4444' // red
};

export function BeePopulationStats({ bees, generation, history, totalSurvived, totalLost }: BeePopulationStatsProps) {
  const aliveBees = bees.filter(b => b.isAlive);
  const averageTraits = calculateAverageTraits(aliveBees);
  
  const traits = ['waggleDance', 'pollenCapacity', 'navigation', 'stingDefense'] as const;
  
  // Get previous generation's averages for comparison
  const previousStats = history.length > 0 ? history[history.length - 1] : null;
  
  const getChangeIndicator = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 2) return null;
    return diff > 0 ? (
      <span className="bee-change-indicator up">↑{diff}</span>
    ) : (
      <span className="bee-change-indicator down">↓{Math.abs(diff)}</span>
    );
  };

  // Calculate survival rate from cumulative totals
  const totalFaced = totalSurvived + totalLost;
  const survivalRate = totalFaced > 0 ? Math.round((totalSurvived / totalFaced) * 100) : 100;
  
  return (
    <motion.div 
      className="bee-population-stats"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bee-stats-header">
        <h2>🐝 Hive Stats</h2>
        <div className="bee-generation-badge">
          <span className="bee-gen-label">Generation</span>
          <span className="bee-gen-number">{generation}</span>
        </div>
      </div>
      
      <div className="bee-stats-overview">
        <div className="bee-stat-item">
          <span className="bee-stat-icon">✅</span>
          <span className="bee-stat-value">{totalSurvived}</span>
          <span className="bee-stat-label">Survived</span>
        </div>
        <div className="bee-stat-item">
          <span className="bee-stat-icon">😇</span>
          <span className="bee-stat-value">{totalLost}</span>
          <span className="bee-stat-label">Lost</span>
        </div>
      </div>
      
      <div className="bee-survival-rate">
        <div className="bee-rate-label">
          <span>Survival Rate</span>
          <span className={`bee-rate-value ${survivalRate >= 50 ? 'good' : 'poor'}`}>{survivalRate}%</span>
        </div>
        <div className="bee-rate-bar">
          <motion.div 
            className={`bee-rate-fill ${survivalRate >= 50 ? 'good' : 'poor'}`}
            initial={{ width: 0 }}
            animate={{ width: `${survivalRate}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
      
      <div className="bee-average-traits">
        <h3>Average Traits</h3>
        <p className="bee-traits-explanation">
          These numbers show what the "typical" bee looks like now!
        </p>
        
        {traits.map(trait => {
          const value = averageTraits[trait];
          const rating = getTraitRating(value);
          const previousValue = previousStats?.averageTraits[trait];
          
          return (
            <div key={trait} className="bee-average-trait">
              <div className="bee-trait-header">
                <span className="bee-trait-icon">{getTraitEmoji(trait)}</span>
                <span className="bee-trait-title">{getTraitName(trait)}</span>
                {getChangeIndicator(value, previousValue)}
              </div>
              <div className="bee-trait-bar-container">
                <motion.div 
                  className="bee-trait-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ backgroundColor: rating.color }}
                />
                <div className="bee-trait-markers">
                  {[0, 25, 50, 75, 100].map(mark => (
                    <div key={mark} className="bee-marker" style={{ left: `${mark}%` }} />
                  ))}
                </div>
              </div>
              <div className="bee-trait-info">
                <span className="bee-trait-value-display" style={{ color: rating.color }}>{value}</span>
                <span className="bee-trait-rating" style={{ color: rating.color }}>{rating.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {history.length > 0 && (
        <div className="bee-evolution-history">
          <h3>📈 Evolution Over Time</h3>
          
          {/* Compact horizontal mini-bars */}
          <div className="bee-history-grid-compact">
            {history.map((stats, i) => (
              <div key={i} className="bee-history-bar-group-compact">
                <div className="bee-history-mini-bars">
                  {traits.map(trait => (
                    <div 
                      key={trait}
                      className="bee-history-mini-bar"
                      style={{ 
                        width: `${stats.averageTraits[trait]}%`,
                        backgroundColor: TRAIT_COLORS[trait]
                      }}
                      title={`${getTraitName(trait)}: ${stats.averageTraits[trait]}`}
                    />
                  ))}
                </div>
                <span className="bee-history-label-compact">
                  {stats.generation} {getEventEmoji(stats.event)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Line chart */}
          {history.length >= 2 && (
            <div className="bee-line-chart-container">
              <h4>📊 Trait Trends</h4>
              <div className="bee-line-chart">
                <svg viewBox="0 0 300 150" className="bee-chart-svg">
                  {/* Grid lines */}
                  <line x1="40" y1="10" x2="40" y2="120" stroke="rgba(120,53,15,0.2)" />
                  <line x1="40" y1="120" x2="290" y2="120" stroke="rgba(120,53,15,0.2)" />
                  <line x1="40" y1="65" x2="290" y2="65" stroke="rgba(120,53,15,0.1)" strokeDasharray="4" />
                  <line x1="40" y1="10" x2="290" y2="10" stroke="rgba(120,53,15,0.1)" strokeDasharray="4" />
                  
                  {/* Y-axis labels */}
                  <text x="35" y="123" fill="rgba(120,53,15,0.5)" fontSize="8" textAnchor="end">0</text>
                  <text x="35" y="68" fill="rgba(120,53,15,0.5)" fontSize="8" textAnchor="end">50</text>
                  <text x="35" y="14" fill="rgba(120,53,15,0.5)" fontSize="8" textAnchor="end">100</text>
                  
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
                        fill="rgba(120,53,15,0.6)"
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
              <div className="bee-chart-legend">
                {traits.map(trait => (
                  <div key={trait} className="bee-legend-item">
                    <span className="bee-legend-color" style={{ backgroundColor: TRAIT_COLORS[trait] }} />
                    <span className="bee-legend-label">{getTraitEmoji(trait)} {getTraitName(trait)}</span>
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
