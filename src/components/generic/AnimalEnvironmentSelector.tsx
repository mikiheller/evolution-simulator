import { motion } from 'framer-motion';
import type { AnimalConfig, EventConfig } from '../../config/animals';
import './AnimalEnvironmentSelector.css';

interface AnimalEnvironmentSelectorProps {
  config: AnimalConfig;
  onSelectEvent: (eventId: string) => void;
  disabled?: boolean;
}

function EventCard({ 
  event, 
  onClick, 
  disabled,
  theme
}: { 
  event: EventConfig; 
  onClick: () => void;
  disabled?: boolean;
  theme: AnimalConfig['theme'];
}) {
  return (
    <motion.button
      className={`animal-event-card ${disabled ? 'disabled' : ''}`}
      style={{
        background: theme.cardBg,
        borderColor: theme.cardBorder,
      }}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05, y: -5 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <span className="animal-event-emoji">{event.emoji}</span>
      <h3 className="animal-event-name" style={{ color: theme.secondary }}>
        {event.name}
      </h3>
      <p className="animal-event-description" style={{ color: theme.secondary }}>
        {event.description}
      </p>
    </motion.button>
  );
}

export function AnimalEnvironmentSelector({ 
  config, 
  onSelectEvent, 
  disabled 
}: AnimalEnvironmentSelectorProps) {
  return (
    <div className="animal-environment-selector">
      <div className="animal-selector-header">
        <h2 style={{ color: config.theme.secondary }}>
          {config.environment.emoji} What Happens This Season?
        </h2>
        <p style={{ color: config.theme.secondary }}>
          Choose what challenge the {config.plural} will face!
        </p>
      </div>
      
      <div className="animal-events-grid">
        {config.events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onSelectEvent(event.id)}
            disabled={disabled}
            theme={config.theme}
          />
        ))}
      </div>
    </div>
  );
}
