import { motion } from 'framer-motion';
import type { Bee, BeeTraits } from '../types/bee';
import { getTraitRating, getTraitEmoji, getTraitName } from '../utils/beeUtils';
import './BeeCard.css';

interface BeeCardProps {
  bee: Bee;
  showDetails?: boolean;
}

// Calculate bee visual appearance based on traits
function getBeeStyle(traits: BeeTraits) {
  // Pollen capacity affects the bee body size (40-70px base)
  const size = 40 + (traits.pollenCapacity / 100) * 30;
  
  // Navigation affects wing speed (faster = better navigation)
  const wingSpeed = 0.1 + (1 - traits.navigation / 100) * 0.2;
  
  // Sting defense affects stinger visibility
  const stingerSize = 5 + (traits.stingDefense / 100) * 10;
  
  // Waggle dance affects body wiggle animation
  const wiggleIntensity = traits.waggleDance / 100;
  
  // Color based on overall health/traits - golden yellow to darker amber
  const avgTrait = (traits.waggleDance + traits.pollenCapacity + traits.navigation + traits.stingDefense) / 4;
  const brightness = 50 + (avgTrait / 100) * 30; // 50-80% brightness
  const bodyColor = `hsl(45, 90%, ${brightness}%)`;
  const stripeColor = `hsl(30, 60%, ${brightness - 30}%)`;
  
  return {
    width: size,
    height: size * 0.7,
    wingSpeed,
    stingerSize,
    wiggleIntensity,
    bodyColor,
    stripeColor
  };
}

function TraitBar({ trait, value }: { trait: keyof BeeTraits; value: number }) {
  const rating = getTraitRating(value);
  
  return (
    <div className="bee-trait-bar">
      <div className="bee-trait-label">
        <span className="bee-trait-emoji">{getTraitEmoji(trait)}</span>
        <span className="bee-trait-name">{getTraitName(trait)}</span>
      </div>
      <div className="bee-trait-meter">
        <motion.div 
          className="bee-trait-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ backgroundColor: rating.color }}
        />
      </div>
      <span className="bee-trait-value" style={{ color: rating.color }}>{value}</span>
    </div>
  );
}

export function BeeCard({ bee, showDetails = true }: BeeCardProps) {
  const style = getBeeStyle(bee.traits);
  
  return (
    <motion.div 
      className={`bee-card ${!bee.isAlive ? 'dead' : ''}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      layout
    >
      <div className="bee-avatar-container">
        <motion.div 
          className="bee-avatar"
          style={{
            width: style.width,
            height: style.height,
            opacity: bee.isAlive ? 1 : 0.3,
          }}
          animate={{
            x: bee.isAlive ? [0, style.wiggleIntensity * 3, 0, -style.wiggleIntensity * 3, 0] : 0,
            y: bee.isAlive ? [0, -3, 0] : 0
          }}
          transition={{
            duration: 0.8,
            repeat: bee.isAlive ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {/* Wings */}
          <motion.div 
            className="bee-wing left"
            animate={{ rotate: bee.isAlive ? [-20, 20, -20] : 0 }}
            transition={{ duration: style.wingSpeed, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="bee-wing right"
            animate={{ rotate: bee.isAlive ? [20, -20, 20] : 0 }}
            transition={{ duration: style.wingSpeed, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Body */}
          <div 
            className="bee-body" 
            style={{ 
              background: `linear-gradient(90deg, 
                ${style.bodyColor} 0%, 
                ${style.stripeColor} 20%, 
                ${style.bodyColor} 40%, 
                ${style.stripeColor} 60%, 
                ${style.bodyColor} 80%, 
                ${style.stripeColor} 100%)`
            }}
          >
            {/* Head */}
            <div className="bee-head">
              <div className="bee-antenna left" />
              <div className="bee-antenna right" />
              <div className="bee-eye left" />
              <div className="bee-eye right" />
            </div>
            
            {/* Stinger */}
            <div 
              className="bee-stinger" 
              style={{ 
                width: style.stingerSize,
                borderLeftWidth: style.stingerSize / 2,
                borderRightWidth: style.stingerSize / 2,
                borderTopWidth: style.stingerSize
              }} 
            />
          </div>
          
          {/* Pollen baskets (visible based on pollen capacity) */}
          {bee.traits.pollenCapacity > 40 && (
            <>
              <div className="bee-pollen left" style={{ 
                width: 6 + (bee.traits.pollenCapacity / 100) * 6,
                height: 6 + (bee.traits.pollenCapacity / 100) * 6 
              }} />
              <div className="bee-pollen right" style={{ 
                width: 6 + (bee.traits.pollenCapacity / 100) * 6,
                height: 6 + (bee.traits.pollenCapacity / 100) * 6 
              }} />
            </>
          )}
          
          {!bee.isAlive && <div className="bee-halo">😇</div>}
        </motion.div>
      </div>
      
      <div className="bee-info">
        <h3 className="bee-name">{bee.name}</h3>
        <span className="bee-generation">Gen {bee.generation}</span>
      </div>
      
      {showDetails && (
        <div className="bee-traits">
          <TraitBar trait="waggleDance" value={bee.traits.waggleDance} />
          <TraitBar trait="pollenCapacity" value={bee.traits.pollenCapacity} />
          <TraitBar trait="navigation" value={bee.traits.navigation} />
          <TraitBar trait="stingDefense" value={bee.traits.stingDefense} />
        </div>
      )}
    </motion.div>
  );
}
