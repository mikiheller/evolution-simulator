import { motion } from 'framer-motion';
import type { Animal } from '../../types/animal';
import type { AnimalConfig, TraitConfig } from '../../config/animals';
import { getTraitRating } from '../../types/animal';
import './AnimalCard.css';

interface AnimalCardProps {
  animal: Animal;
  config: AnimalConfig;
  showDetails?: boolean;
}

function TraitBar({ 
  trait, 
  value, 
  themeColor 
}: { 
  trait: TraitConfig; 
  value: number; 
  themeColor: string;
}) {
  const rating = getTraitRating(value, trait);
  
  return (
    <div className="animal-trait-bar">
      <div className="animal-trait-label">
        <span className="animal-trait-emoji">{trait.emoji}</span>
        <span className="animal-trait-name">{trait.name}</span>
      </div>
      <div className="animal-trait-meter" style={{ borderColor: themeColor }}>
        <motion.div 
          className="animal-trait-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ backgroundColor: rating.color }}
        />
      </div>
      <span className="animal-trait-value" style={{ color: rating.color }}>{value}</span>
    </div>
  );
}

// Simple emoji-based animal display (works for any animal)
function AnimalAvatar({ 
  animal, 
  config, 
  isAlive 
}: { 
  animal: Animal; 
  config: AnimalConfig; 
  isAlive: boolean;
}) {
  // Calculate size based on average traits (or specific size trait if exists)
  const avgTrait = Object.values(animal.traits).reduce((a, b) => a + b, 0) / Object.values(animal.traits).length;
  const size = 50 + (avgTrait / 100) * 30;
  
  return (
    <motion.div 
      className="animal-avatar"
      style={{
        fontSize: size,
        opacity: isAlive ? 1 : 0.3,
      }}
      animate={{
        y: isAlive ? [0, -5, 0] : 0,
        scale: isAlive ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 2,
        repeat: isAlive ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {config.emoji}
      {!isAlive && <div className="animal-halo">😇</div>}
    </motion.div>
  );
}

export function AnimalCard({ animal, config, showDetails = true }: AnimalCardProps) {
  const theme = config.theme;
  
  return (
    <motion.div 
      className={`animal-card ${!animal.isAlive ? 'dead' : ''}`}
      style={{
        background: theme.cardBg,
        borderColor: theme.cardBorder,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="animal-avatar-container">
        <AnimalAvatar animal={animal} config={config} isAlive={animal.isAlive} />
      </div>
      
      <div className="animal-info">
        <h3 className="animal-name" style={{ color: theme.secondary }}>{animal.name}</h3>
        <span className="animal-generation" style={{ 
          background: theme.cardBg, 
          color: theme.secondary 
        }}>
          Gen {animal.generation}
        </span>
      </div>
      
      {showDetails && (
        <div className="animal-traits">
          {config.traits.map(trait => (
            <TraitBar 
              key={trait.id}
              trait={trait}
              value={animal.traits[trait.id]}
              themeColor={theme.cardBorder}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
