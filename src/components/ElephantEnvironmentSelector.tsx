import { motion } from 'framer-motion';
import type { ElephantEnvironmentEvent, ElephantEnvironmentEventInfo } from '../types/elephant';
import { ELEPHANT_ENVIRONMENT_EVENTS } from '../types/elephant';
import './ElephantEnvironmentSelector.css';

interface ElephantEnvironmentSelectorProps {
  onSelectEvent: (event: ElephantEnvironmentEvent) => void;
  disabled?: boolean;
}

function EventCard({ event, onClick, disabled }: { 
  event: ElephantEnvironmentEventInfo; 
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      className={`elephant-event-card ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05, y: -5 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <span className="elephant-event-emoji">{event.emoji}</span>
      <h3 className="elephant-event-name">{event.name}</h3>
      <p className="elephant-event-description">{event.description}</p>
    </motion.button>
  );
}

export function ElephantEnvironmentSelector({ onSelectEvent, disabled }: ElephantEnvironmentSelectorProps) {
  return (
    <div className="elephant-environment-selector">
      <div className="elephant-selector-header">
        <h2>🌍 What Happens This Year?</h2>
        <p>Choose what challenge the elephants will face!</p>
      </div>
      
      <div className="elephant-events-grid">
        {ELEPHANT_ENVIRONMENT_EVENTS.map(event => (
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
