import { motion } from 'framer-motion';
import type { Elephant, ElephantTraits } from '../types/elephant';
import { getElephantTraitRating, getElephantTraitEmoji, getElephantTraitName } from '../utils/elephantUtils';
import './ElephantCard.css';

interface ElephantCardProps {
  elephant: Elephant;
  showDetails?: boolean;
}

// Calculate elephant visual appearance based on traits
function getElephantStyle(traits: ElephantTraits) {
  // Size affected by trunk strength (stronger = bigger body)
  const bodySize = 55 + (traits.trunkStrength / 100) * 35;
  
  // Tusk size directly affects visual tusks
  const tuskLength = 8 + (traits.tuskSize / 100) * 20;
  
  // Memory affects how alert they look (ear position)
  const earSize = 25 + (traits.memory / 100) * 15;
  
  // Hearing affects animation (more alert = faster subtle movements)
  const animationDuration = 3 - (traits.hearing / 100) * 1.5;
  
  // Color varies from lighter gray to darker gray based on overall "health"
  const avgTrait = (traits.tuskSize + traits.memory + traits.trunkStrength + traits.hearing) / 4;
  const grayValue = Math.round(100 + (avgTrait / 100) * 50); // 100-150 gray range
  const bodyColor = `rgb(${grayValue}, ${grayValue + 5}, ${grayValue + 10})`;
  
  // Ear inner color: slightly pink/lighter
  const earInnerColor = `rgb(${grayValue + 40}, ${grayValue + 30}, ${grayValue + 35})`;
  
  return {
    bodySize,
    tuskLength,
    earSize,
    animationDuration,
    bodyColor,
    earInnerColor
  };
}

function TraitBar({ trait, value }: { trait: keyof ElephantTraits; value: number }) {
  const rating = getElephantTraitRating(value, trait);
  
  return (
    <div className="elephant-trait-bar">
      <div className="elephant-trait-label">
        <span className="elephant-trait-emoji">{getElephantTraitEmoji(trait)}</span>
        <span className="elephant-trait-name">{getElephantTraitName(trait)}</span>
      </div>
      <div className="elephant-trait-meter">
        <motion.div 
          className="elephant-trait-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ backgroundColor: rating.color }}
        />
      </div>
      <span className="elephant-trait-value" style={{ color: rating.color }}>{value}</span>
    </div>
  );
}

export function ElephantCard({ elephant, showDetails = true }: ElephantCardProps) {
  const style = getElephantStyle(elephant.traits);
  
  return (
    <motion.div 
      className={`elephant-card ${!elephant.isAlive ? 'dead' : ''}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      layout
    >
      <div className="elephant-avatar-container">
        <motion.div 
          className="elephant-avatar"
          style={{
            width: style.bodySize,
            height: style.bodySize * 0.75,
            opacity: elephant.isAlive ? 1 : 0.3,
          }}
          animate={{
            y: elephant.isAlive ? [0, -3, 0] : 0
          }}
          transition={{
            duration: style.animationDuration,
            repeat: elephant.isAlive ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {/* Elephant body */}
          <div className="elephant-body" style={{ backgroundColor: style.bodyColor }}>
            {/* Ears */}
            <div 
              className="elephant-ear left" 
              style={{ 
                width: style.earSize,
                height: style.earSize * 1.2,
                backgroundColor: style.bodyColor,
                '--ear-inner': style.earInnerColor
              } as React.CSSProperties} 
            />
            <div 
              className="elephant-ear right" 
              style={{ 
                width: style.earSize,
                height: style.earSize * 1.2,
                backgroundColor: style.bodyColor,
                '--ear-inner': style.earInnerColor
              } as React.CSSProperties} 
            />
            
            {/* Head */}
            <div className="elephant-head" style={{ backgroundColor: style.bodyColor }}>
              {/* Eyes */}
              <div className="elephant-eye left" />
              <div className="elephant-eye right" />
              
              {/* Trunk */}
              <div className="elephant-trunk" style={{ backgroundColor: style.bodyColor }} />
              
              {/* Tusks */}
              {style.tuskLength > 10 && (
                <>
                  <div 
                    className="elephant-tusk left" 
                    style={{ height: style.tuskLength }}
                  />
                  <div 
                    className="elephant-tusk right" 
                    style={{ height: style.tuskLength }}
                  />
                </>
              )}
            </div>
            
            {/* Legs */}
            <div className="elephant-legs">
              <div className="elephant-leg" style={{ backgroundColor: style.bodyColor }} />
              <div className="elephant-leg" style={{ backgroundColor: style.bodyColor }} />
              <div className="elephant-leg" style={{ backgroundColor: style.bodyColor }} />
              <div className="elephant-leg" style={{ backgroundColor: style.bodyColor }} />
            </div>
            
            {/* Tail */}
            <div className="elephant-tail" style={{ backgroundColor: style.bodyColor }} />
          </div>
          
          {!elephant.isAlive && <div className="elephant-halo">😇</div>}
        </motion.div>
      </div>
      
      <div className="elephant-info">
        <h3 className="elephant-name">{elephant.name}</h3>
        <span className="elephant-generation">Gen {elephant.generation}</span>
      </div>
      
      {showDetails && (
        <div className="elephant-traits">
          <TraitBar trait="tuskSize" value={elephant.traits.tuskSize} />
          <TraitBar trait="memory" value={elephant.traits.memory} />
          <TraitBar trait="trunkStrength" value={elephant.traits.trunkStrength} />
          <TraitBar trait="hearing" value={elephant.traits.hearing} />
        </div>
      )}
    </motion.div>
  );
}
