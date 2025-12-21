import { motion } from 'framer-motion';
import type { Animal, PopulationStats as PopulationStatsType } from '../../types/animal';
import type { AnimalConfig } from '../../config/animals';
import { calculateAverageTraits, getTraitRating } from '../../types/animal';
import './AnimalPopulationStats.css';

interface AnimalPopulationStatsProps {
  animals: Animal[];
  config: AnimalConfig;
  generation: number;
  history: PopulationStatsType[];
  totalSurvived: number;
  totalLost: number;
}

// Generate colors for traits in charts
function getTraitColors(config: AnimalConfig): Record<string, string> {
  const colors = ['#f472b6', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa', '#fb7185'];
  const traitColors: Record<string, string> = {};
  config.traits.forEach((trait, i) => {
    traitColors[trait.id] = colors[i % colors.length];
  });
  return traitColors;
}

export function AnimalPopulationStats({ 
  animals, 
  config,
  generation, 
  history, 
  totalSurvived, 
  totalLost 
}: AnimalPopulationStatsProps) {
  const aliveAnimals = animals.filter(a => a.isAlive);
  const averageTraits = calculateAverageTraits(aliveAnimals, config);
  const theme = config.theme;
  const traitColors = getTraitColors(config);
  
  const previousStats = history.length > 0 ? history[history.length - 1] : null;
  
  const getChangeIndicator = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 2) return null;
    return diff > 0 ? (
      <span className="animal-change-indicator up">↑{diff}</span>
    ) : (
      <span className="animal-change-indicator down">↓{Math.abs(diff)}</span>
    );
  };

  const totalFaced = totalSurvived + totalLost;
  const survivalRate = totalFaced > 0 ? Math.round((totalSurvived / totalFaced) * 100) : 100;

  // Get event emoji by id
  const getEventEmoji = (eventId: string | undefined): string => {
    if (!eventId) return '';
    const event = config.events.find(e => e.id === eventId);
    return event?.emoji || '';
  };
  
  return (
    <motion.div 
      className="animal-population-stats"
      style={{
        background: theme.cardBg,
        borderColor: theme.cardBorder,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="animal-stats-header">
        <h2 style={{ color: theme.secondary }}>
          {config.emoji} {config.name.split(' ')[0]} Stats
        </h2>
        <div className="animal-generation-badge" style={{ background: theme.primary }}>
          <span className="animal-gen-label">Generation</span>
          <span className="animal-gen-number">{generation}</span>
        </div>
      </div>
      
      <div className="animal-stats-overview">
        <div className="animal-stat-item" style={{ borderColor: theme.cardBorder }}>
          <span className="animal-stat-icon">✅</span>
          <span className="animal-stat-value" style={{ color: theme.secondary }}>{totalSurvived}</span>
          <span className="animal-stat-label">Survived</span>
        </div>
        <div className="animal-stat-item" style={{ borderColor: theme.cardBorder }}>
          <span className="animal-stat-icon">😇</span>
          <span className="animal-stat-value" style={{ color: theme.secondary }}>{totalLost}</span>
          <span className="animal-stat-label">Lost</span>
        </div>
      </div>
      
      <div className="animal-survival-rate">
        <div className="animal-rate-label">
          <span style={{ color: theme.secondary }}>Survival Rate</span>
          <span className={`animal-rate-value ${survivalRate >= 50 ? 'good' : 'poor'}`}>
            {survivalRate}%
          </span>
        </div>
        <div className="animal-rate-bar" style={{ borderColor: theme.cardBorder }}>
          <motion.div 
            className={`animal-rate-fill ${survivalRate >= 50 ? 'good' : 'poor'}`}
            initial={{ width: 0 }}
            animate={{ width: `${survivalRate}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
      
      <div className="animal-average-traits">
        <h3 style={{ color: theme.secondary }}>Average Traits</h3>
        <p className="animal-traits-explanation" style={{ color: theme.secondary }}>
          These numbers show what the "typical" {config.singular} looks like now!
        </p>
        
        {config.traits.map(trait => {
          const value = averageTraits[trait.id];
          const rating = getTraitRating(value, trait);
          const previousValue = previousStats?.averageTraits[trait.id];
          
          return (
            <div key={trait.id} className="animal-average-trait">
              <div className="animal-trait-header">
                <span className="animal-trait-icon">{trait.emoji}</span>
                <span className="animal-trait-title" style={{ color: theme.secondary }}>
                  {trait.name}
                </span>
                {trait.lowIsGood && (
                  <span className="animal-trait-hint">(smaller=better)</span>
                )}
                {getChangeIndicator(value, previousValue)}
              </div>
              <div className="animal-trait-bar-container" style={{ borderColor: theme.cardBorder }}>
                <motion.div 
                  className="animal-trait-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ backgroundColor: rating.color }}
                />
              </div>
              <div className="animal-trait-info">
                <span className="animal-trait-value-display" style={{ color: rating.color }}>
                  {value}
                </span>
                <span className="animal-trait-rating" style={{ color: rating.color }}>
                  {rating.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {history.length > 0 && (
        <div className="animal-evolution-history">
          <h3 style={{ color: theme.secondary }}>📈 Evolution Over Time</h3>
          
          <div className="animal-history-grid-compact">
            {history.map((stats, i) => (
              <div key={i} className="animal-history-bar-group-compact">
                <div className="animal-history-mini-bars">
                  {config.traits.map(trait => (
                    <div 
                      key={trait.id}
                      className="animal-history-mini-bar"
                      style={{ 
                        width: `${stats.averageTraits[trait.id]}%`,
                        backgroundColor: traitColors[trait.id]
                      }}
                      title={`${trait.name}: ${stats.averageTraits[trait.id]}`}
                    />
                  ))}
                </div>
                <span className="animal-history-label-compact" style={{ color: theme.secondary }}>
                  {stats.generation} {getEventEmoji(stats.eventId)}
                </span>
              </div>
            ))}
          </div>
          
          {history.length >= 2 && (
            <div className="animal-line-chart-container">
              <h4 style={{ color: theme.secondary }}>📊 Trait Trends</h4>
              <div className="animal-line-chart" style={{ borderColor: theme.cardBorder }}>
                <svg viewBox="0 0 300 150" className="animal-chart-svg">
                  <line x1="40" y1="10" x2="40" y2="120" stroke="rgba(0,0,0,0.1)" />
                  <line x1="40" y1="120" x2="290" y2="120" stroke="rgba(0,0,0,0.1)" />
                  <line x1="40" y1="65" x2="290" y2="65" stroke="rgba(0,0,0,0.05)" strokeDasharray="4" />
                  <line x1="40" y1="10" x2="290" y2="10" stroke="rgba(0,0,0,0.05)" strokeDasharray="4" />
                  
                  <text x="35" y="123" fill="rgba(0,0,0,0.4)" fontSize="8" textAnchor="end">0</text>
                  <text x="35" y="68" fill="rgba(0,0,0,0.4)" fontSize="8" textAnchor="end">50</text>
                  <text x="35" y="14" fill="rgba(0,0,0,0.4)" fontSize="8" textAnchor="end">100</text>
                  
                  {config.traits.map(trait => {
                    const points = history.map((stats, i) => {
                      const x = 40 + (i / (history.length - 1)) * 250;
                      const y = 120 - (stats.averageTraits[trait.id] / 100) * 110;
                      return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                      <polyline
                        key={trait.id}
                        points={points}
                        fill="none"
                        stroke={traitColors[trait.id]}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  })}
                  
                  {config.traits.map(trait => (
                    history.map((stats, i) => {
                      const x = 40 + (i / (history.length - 1)) * 250;
                      const y = 120 - (stats.averageTraits[trait.id] / 100) * 110;
                      return (
                        <circle
                          key={`${trait.id}-${i}`}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={traitColors[trait.id]}
                        />
                      );
                    })
                  ))}
                  
                  {history.map((stats, i) => {
                    const x = 40 + (i / (history.length - 1)) * 250;
                    return (
                      <text
                        key={i}
                        x={x}
                        y="135"
                        fill="rgba(0,0,0,0.5)"
                        fontSize="8"
                        textAnchor="middle"
                      >
                        {stats.generation}
                      </text>
                    );
                  })}
                </svg>
              </div>
              
              <div className="animal-chart-legend">
                {config.traits.map(trait => (
                  <div key={trait.id} className="animal-legend-item">
                    <span 
                      className="animal-legend-color" 
                      style={{ backgroundColor: traitColors[trait.id] }} 
                    />
                    <span className="animal-legend-label" style={{ color: theme.secondary }}>
                      {trait.emoji} {trait.name}
                    </span>
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
