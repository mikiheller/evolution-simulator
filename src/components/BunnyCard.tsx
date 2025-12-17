import { motion } from 'framer-motion';
import type { Bunny, BunnyTraits } from '../types/bunny';
import { getTraitRating, getTraitEmoji, getTraitName } from '../utils/bunnyUtils';
import './BunnyCard.css';

interface BunnyCardProps {
  bunny: Bunny;
  isSelected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
}

// Calculate bunny visual appearance based on traits
function getBunnyStyle(traits: BunnyTraits) {
  // Size affects the bunny size (50-90px base)
  const size = 50 + (traits.size / 100) * 40;
  
  // Fur thickness affects how fluffy they look (border-radius and shadow)
  const fluffiness = traits.furThickness / 100;
  
  // Camouflage affects opacity (better camo = more transparent)
  const opacity = 0.6 + (1 - traits.camouflage / 100) * 0.4;
  
  // Speed affects animation speed
  const animationDuration = 2 - (traits.speed / 100) * 1.5;
  
  return {
    width: size,
    height: size * 0.8,
    opacity,
    animationDuration,
    fluffiness
  };
}

function TraitBar({ trait, value }: { trait: keyof BunnyTraits; value: number }) {
  const rating = getTraitRating(value);
  
  return (
    <div className="trait-bar">
      <div className="trait-label">
        <span className="trait-emoji">{getTraitEmoji(trait)}</span>
        <span className="trait-name">{getTraitName(trait)}</span>
      </div>
      <div className="trait-meter">
        <motion.div 
          className="trait-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ backgroundColor: rating.color }}
        />
      </div>
      <span className="trait-value" style={{ color: rating.color }}>{value}</span>
    </div>
  );
}

export function BunnyCard({ bunny, isSelected, onClick, showDetails = true }: BunnyCardProps) {
  const style = getBunnyStyle(bunny.traits);
  
  return (
    <motion.div 
      className={`bunny-card ${isSelected ? 'selected' : ''} ${!bunny.isAlive ? 'dead' : ''}`}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="bunny-avatar-container">
        <motion.div 
          className="bunny-avatar"
          style={{
            width: style.width,
            height: style.height,
            opacity: bunny.isAlive ? style.opacity : 0.3,
            boxShadow: `0 0 ${style.fluffiness * 20}px ${style.fluffiness * 10}px rgba(255,255,255,${style.fluffiness * 0.5})`
          }}
          animate={{
            y: bunny.isAlive ? [0, -5, 0] : 0
          }}
          transition={{
            duration: style.animationDuration,
            repeat: bunny.isAlive ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <div className="bunny-body">
            <div className="bunny-ear left" style={{ height: 20 + style.fluffiness * 15 }} />
            <div className="bunny-ear right" style={{ height: 20 + style.fluffiness * 15 }} />
            <div className="bunny-face">
              <div className="bunny-eye left" />
              <div className="bunny-eye right" />
              <div className="bunny-nose" />
            </div>
            <div className="bunny-feet">
              <div className="bunny-foot" />
              <div className="bunny-foot" />
            </div>
          </div>
          {!bunny.isAlive && <div className="bunny-halo">😇</div>}
        </motion.div>
      </div>
      
      <div className="bunny-info">
        <h3 className="bunny-name">{bunny.name}</h3>
        <span className="bunny-generation">Gen {bunny.generation}</span>
      </div>
      
      {showDetails && (
        <div className="bunny-traits">
          <TraitBar trait="furThickness" value={bunny.traits.furThickness} />
          <TraitBar trait="speed" value={bunny.traits.speed} />
          <TraitBar trait="size" value={bunny.traits.size} />
          <TraitBar trait="camouflage" value={bunny.traits.camouflage} />
        </div>
      )}
    </motion.div>
  );
}

