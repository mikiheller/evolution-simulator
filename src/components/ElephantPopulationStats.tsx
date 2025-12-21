import { motion } from 'framer-motion';
import type { Elephant, ElephantPopulationStats as ElephantPopulationStatsType } from '../types/elephant';
import { ELEPHANT_ENVIRONMENT_EVENTS } from '../types/elephant';
import { calculateAverageElephantTraits, getElephantTraitEmoji, getElephantTraitName, getElephantTraitRating } from '../utils/elephantUtils';
import './ElephantPopulationStats.css';

// Get emoji for an event
function getEventEmoji(eventId: string | undefined): string {
  if (!eventId) return '';
  const event = ELEPHANT_ENVIRONMENT_EVENTS.find(e => e.id === eventId);
  return event?.emoji || '';
}

interface ElephantPopulationStatsProps {
  elephants: Elephant[];
  generation: number;
  history: ElephantPopulationStatsType[];
  totalSurvived: number;
  totalLost: number;
}

// Trait colors for the line chart
const TRAIT_COLORS = {
  tuskSize: '#a78bfa',      // purple
  memory: '#60a5fa',        // blue
  trunkStrength: '#34d399', // green
  hearing: '#fbbf24'        // yellow
};

export function ElephantPopulationStats({ elephants, generation, history, totalSurvived, totalLost }: ElephantPopulationStatsProps) {
  const aliveElephants = elephants.filter(e => e.isAlive);
  const averageTraits = calculateAverageElephantTraits(aliveElephants);
  
  const traits = ['tuskSize', 'memory', 'trunkStrength', 'hearing'] as const;
  
  // Get previous generation's averages for comparison
  const previousStats = history.length > 0 ? history[history.length - 1] : null;
  
  const getChangeIndicator = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 2) return null;
    return diff > 0 ? (
      <span className="elephant-change-indicator up">↑{diff}</span>
    ) : (
      <span className="elephant-change-indicator down">↓{Math.abs(diff)}</span>
    );
  };

  // Calculate survival rate from cumulative totals
  const totalFaced = totalSurvived + totalLost;
  const survivalRate = totalFaced > 0 ? Math.round((totalSurvived / totalFaced) * 100) : 100;
  
  return (
    <motion.div 
      className="elephant-population-stats"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="elephant-stats-header">
        <h2>🐘 Herd Stats</h2>
        <div className="elephant-generation-badge">
          <span className="elephant-gen-label">Generation</span>
          <span className="elephant-gen-number">{generation}</span>
        </div>
      </div>
      
      <div className="elephant-stats-overview">
        <div className="elephant-stat-item">
          <span className="elephant-stat-icon">✅</span>
          <span className="elephant-stat-value">{totalSurvived}</span>
          <span className="elephant-stat-label">Survived</span>
        </div>
        <div className="elephant-stat-item">
          <span className="elephant-stat-icon">😇</span>
          <span className="elephant-stat-value">{totalLost}</span>
          <span className="elephant-stat-label">Lost</span>
        </div>
      </div>
      
      <div className="elephant-survival-rate">
        <div className="elephant-rate-label">
          <span>Survival Rate</span>
          <span className={`elephant-rate-value ${survivalRate >= 50 ? 'good' : 'poor'}`}>{survivalRate}%</span>
        </div>
        <div className="elephant-rate-bar">
          <motion.div 
            className={`elephant-rate-fill ${survivalRate >= 50 ? 'good' : 'poor'}`}
            initial={{ width: 0 }}
            animate={{ width: `${survivalRate}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
      
      <div className="elephant-average-traits">
        <h3>Average Traits</h3>
        <p className="elephant-traits-explanation">
          These numbers show what the "typical" elephant looks like now!
        </p>
        
        {traits.map(trait => {
          const value = averageTraits[trait];
          const rating = getElephantTraitRating(value, trait);
          const previousValue = previousStats?.averageTraits[trait];
          
          return (
            <div key={trait} className="elephant-average-trait">
              <div className="elephant-trait-header">
                <span className="elephant-trait-icon">{getElephantTraitEmoji(trait)}</span>
                <span className="elephant-trait-title">{getElephantTraitName(trait)}</span>
                {trait === 'tuskSize' && <span className="elephant-trait-hint">(trade-off!)</span>}
                {getChangeIndicator(value, previousValue)}
              </div>
              <div className="elephant-trait-bar-container">
                <motion.div 
                  className="elephant-trait-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ backgroundColor: rating.color }}
                />
                <div className="elephant-trait-markers">
                  {[0, 25, 50, 75, 100].map(mark => (
                    <div key={mark} className="elephant-marker" style={{ left: `${mark}%` }} />
                  ))}
                </div>
              </div>
              <div className="elephant-trait-info">
                <span className="elephant-trait-value-display" style={{ color: rating.color }}>{value}</span>
                <span className="elephant-trait-rating" style={{ color: rating.color }}>{rating.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {history.length > 0 && (
        <div className="elephant-evolution-history">
          <h3>📈 Evolution Over Time</h3>
          
          {/* Compact horizontal mini-bars */}
          <div className="elephant-history-grid-compact">
            {history.map((stats, i) => (
              <div key={i} className="elephant-history-bar-group-compact">
                <div className="elephant-history-mini-bars">
                  {traits.map(trait => (
                    <div 
                      key={trait}
                      className="elephant-history-mini-bar"
                      style={{ 
                        width: `${stats.averageTraits[trait]}%`,
                        backgroundColor: TRAIT_COLORS[trait]
                      }}
                      title={`${getElephantTraitName(trait)}: ${stats.averageTraits[trait]}`}
                    />
                  ))}
                </div>
                <span className="elephant-history-label-compact">
                  {stats.generation} {getEventEmoji(stats.event)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Line chart */}
          {history.length >= 2 && (
            <div className="elephant-line-chart-container">
              <h4>📊 Trait Trends</h4>
              <div className="elephant-line-chart">
                <svg viewBox="0 0 300 150" className="elephant-chart-svg">
                  {/* Grid lines */}
                  <line x1="40" y1="10" x2="40" y2="120" stroke="rgba(93, 64, 55, 0.2)" />
                  <line x1="40" y1="120" x2="290" y2="120" stroke="rgba(93, 64, 55, 0.2)" />
                  <line x1="40" y1="65" x2="290" y2="65" stroke="rgba(93, 64, 55, 0.1)" strokeDasharray="4" />
                  <line x1="40" y1="10" x2="290" y2="10" stroke="rgba(93, 64, 55, 0.1)" strokeDasharray="4" />
                  
                  {/* Y-axis labels */}
                  <text x="35" y="123" fill="rgba(93, 64, 55, 0.5)" fontSize="8" textAnchor="end">0</text>
                  <text x="35" y="68" fill="rgba(93, 64, 55, 0.5)" fontSize="8" textAnchor="end">50</text>
                  <text x="35" y="14" fill="rgba(93, 64, 55, 0.5)" fontSize="8" textAnchor="end">100</text>
                  
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
                        fill="rgba(93, 64, 55, 0.6)"
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
              <div className="elephant-chart-legend">
                {traits.map(trait => (
                  <div key={trait} className="elephant-legend-item">
                    <span className="elephant-legend-color" style={{ backgroundColor: TRAIT_COLORS[trait] }} />
                    <span className="elephant-legend-label">{getElephantTraitEmoji(trait)} {getElephantTraitName(trait)}</span>
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
