import { motion } from 'framer-motion';
import type { EnvironmentEvent, EnvironmentEventInfo } from '../types/bunny';
import { ENVIRONMENT_EVENTS } from '../types/bunny';
import './EnvironmentSelector.css';

interface EnvironmentSelectorProps {
  onSelectEvent: (event: EnvironmentEvent) => void;
  disabled?: boolean;
}

function EventCard({ event, onClick, disabled }: { 
  event: EnvironmentEventInfo; 
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      className={`event-card ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05, y: -5 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <span className="event-emoji">{event.emoji}</span>
      <h3 className="event-name">{event.name}</h3>
      <p className="event-description">{event.description}</p>
    </motion.button>
  );
}

export function EnvironmentSelector({ onSelectEvent, disabled }: EnvironmentSelectorProps) {
  return (
    <div className="environment-selector">
      <div className="selector-header">
        <h2>🌍 What Happens This Year?</h2>
        <p>Choose what challenge the bunnies will face!</p>
      </div>
      
      <div className="events-grid">
        {ENVIRONMENT_EVENTS.map(event => (
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

