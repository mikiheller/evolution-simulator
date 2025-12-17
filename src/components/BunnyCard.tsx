import { motion } from 'framer-motion';
import type { Bunny, BunnyTraits } from '../types/bunny';
import { getTraitRating, getTraitEmoji, getTraitName } from '../utils/bunnyUtils';
import './BunnyCard.css';

interface BunnyCardProps {
  bunny: Bunny;
  showDetails?: boolean;
}

// Calculate bunny visual appearance based on traits
function getBunnyStyle(traits: BunnyTraits) {
  // Size affects the bunny size (50-90px base)
  const size = 50 + (traits.size / 100) * 40;
  
  // Fur thickness affects how fluffy they look (border-radius and shadow)
  const fluffiness = traits.furThickness / 100;
  
  // Speed affects animation speed
  const animationDuration = 2 - (traits.speed / 100) * 1.5;
  
  // Camouflage affects color: high = white (snow), low = brown (stands out)
  const camoRatio = traits.camouflage / 100;
  // Interpolate from brown (#8B7355) to white (#FAFAFA)
  const r = Math.round(139 + (250 - 139) * camoRatio);
  const g = Math.round(115 + (250 - 115) * camoRatio);
  const b = Math.round(85 + (250 - 85) * camoRatio);
  const bodyColor = `rgb(${r}, ${g}, ${b})`;
  
  // Ear inner color: pink tint
  const earR = Math.round(180 + (255 - 180) * camoRatio);
  const earG = Math.round(140 + (200 - 140) * camoRatio);
  const earB = Math.round(130 + (200 - 130) * camoRatio);
  const earColor = `rgb(${earR}, ${earG}, ${earB})`;
  
  return {
    width: size,
    height: size * 0.8,
    animationDuration,
    fluffiness,
    bodyColor,
    earColor
  };
}

function TraitBar({ trait, value }: { trait: keyof BunnyTraits; value: number }) {
  const rating = getTraitRating(value, trait);
  
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

export function BunnyCard({ bunny, showDetails = true }: BunnyCardProps) {
  const style = getBunnyStyle(bunny.traits);
  
  return (
    <motion.div 
      className={`bunny-card ${!bunny.isAlive ? 'dead' : ''}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      layout
    >
      <div className="bunny-avatar-container">
        <motion.div 
          className="bunny-avatar"
          style={{
            width: style.width,
            height: style.height,
            opacity: bunny.isAlive ? 1 : 0.3,
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
          <div className="bunny-body" style={{ background: `linear-gradient(180deg, ${style.bodyColor} 0%, ${style.bodyColor} 100%)` }}>
            <div className="bunny-ear left" style={{ height: 20 + style.fluffiness * 15, background: `linear-gradient(180deg, ${style.bodyColor} 0%, ${style.bodyColor} 100%)`, '--ear-inner': style.earColor } as React.CSSProperties} />
            <div className="bunny-ear right" style={{ height: 20 + style.fluffiness * 15, background: `linear-gradient(180deg, ${style.bodyColor} 0%, ${style.bodyColor} 100%)`, '--ear-inner': style.earColor } as React.CSSProperties} />
            <div className="bunny-face">
              <div className="bunny-eye left" />
              <div className="bunny-eye right" />
              <div className="bunny-nose" />
            </div>
            <div className="bunny-feet">
              <div className="bunny-foot" style={{ background: style.bodyColor }} />
              <div className="bunny-foot" style={{ background: style.bodyColor }} />
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

