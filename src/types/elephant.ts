export interface ElephantTraits {
  tuskSize: number;
  memory: number;
  trunkStrength: number;
  hearing: number;
}

export interface Elephant {
  id: string;
  name: string;
  traits: ElephantTraits;
  generation: number;
  isAlive: boolean;
  parentId?: string;
}

export type ElephantEnvironmentEvent = 
  | 'drought'
  | 'poachers'
  | 'lion_pride'
  | 'long_migration';

export interface ElephantEnvironmentEventInfo {
  id: ElephantEnvironmentEvent;
  name: string;
  description: string;
  emoji: string;
  dangerousTrait: keyof ElephantTraits;
  traitDirection: 'low' | 'high';
}

export const ELEPHANT_ENVIRONMENT_EVENTS: ElephantEnvironmentEventInfo[] = [
  {
    id: 'drought',
    name: 'Severe Drought',
    description: 'Water is scarce! Elephants who remember where to find water will survive.',
    emoji: '☀️',
    dangerousTrait: 'memory',
    traitDirection: 'low'
  },
  {
    id: 'poachers',
    name: 'Poacher Threat',
    description: 'Dangerous poachers are nearby! Elephants with big tusks are targets.',
    emoji: '🎯',
    dangerousTrait: 'tuskSize',
    traitDirection: 'high'
  },
  {
    id: 'lion_pride',
    name: 'Lion Pride Attack',
    description: 'A pride of lions is hunting! Elephants need strong tusks to defend themselves.',
    emoji: '🦁',
    dangerousTrait: 'tuskSize',
    traitDirection: 'low'
  },
  {
    id: 'long_migration',
    name: 'Long Migration',
    description: 'The herd must travel far! Elephants need strong trunks to forage along the way.',
    emoji: '🚶',
    dangerousTrait: 'trunkStrength',
    traitDirection: 'low'
  }
];

export interface ElephantPopulationStats {
  generation: number;
  averageTraits: ElephantTraits;
  populationSize: number;
  event?: ElephantEnvironmentEvent;
}
