import { motion } from 'framer-motion';
import type { BeeEnvironmentEvent, BeeEnvironmentEventInfo } from '../types/bee';
import { BEE_ENVIRONMENT_EVENTS } from '../types/bee';
import './BeeEnvironmentSelector.css';

interface BeeEnvironmentSelectorProps {
  onSelectEvent: (event: BeeEnvironmentEvent) => void;
  disabled?: boolean;
}

function EventCard({ event, onClick, disabled }: { 
  event: BeeEnvironmentEventInfo; 
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      className={`bee-event-card ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05, y: -5 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <span className="bee-event-emoji">{event.emoji}</span>
      <h3 className="bee-event-name">{event.name}</h3>
      <p className="bee-event-description">{event.description}</p>
    </motion.button>
  );
}

export function BeeEnvironmentSelector({ onSelectEvent, disabled }: BeeEnvironmentSelectorProps) {
  return (
    <div className="bee-environment-selector">
      <div className="bee-selector-header">
        <h2>🌻 What Happens This Season?</h2>
        <p>Choose what challenge the bees will face!</p>
      </div>
      
      <div className="bee-events-grid">
        {BEE_ENVIRONMENT_EVENTS.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onSelectEvent(event.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
