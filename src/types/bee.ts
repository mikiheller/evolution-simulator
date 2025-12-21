export interface BeeTraits {
  waggleDance: number;
  pollenCapacity: number;
  navigation: number;
  stingDefense: number;
}

export interface Bee {
  id: string;
  name: string;
  traits: BeeTraits;
  generation: number;
  isAlive: boolean;
  parentId?: string;
}

export type BeeEnvironmentEvent = 
  | 'pesticide'
  | 'bear_attack'
  | 'distant_blooms'
  | 'foggy_weather';

export interface BeeEnvironmentEventInfo {
  id: BeeEnvironmentEvent;
  name: string;
  description: string;
  emoji: string;
  dangerousTrait: keyof BeeTraits;
  traitDirection: 'low' | 'high';
}

export const BEE_ENVIRONMENT_EVENTS: BeeEnvironmentEventInfo[] = [
  {
    id: 'pesticide',
    name: 'Pesticide Exposure',
    description: 'Toxic chemicals in the fields! Bees with poor navigation might not avoid contaminated areas.',
    emoji: '☠️',
    dangerousTrait: 'navigation',
    traitDirection: 'low'
  },
  {
    id: 'bear_attack',
    name: 'Bear Attack',
    description: 'A hungry bear is after the honey! Bees need strong stings to defend the hive.',
    emoji: '🐻',
    dangerousTrait: 'stingDefense',
    traitDirection: 'low'
  },
  {
    id: 'distant_blooms',
    name: 'Distant Blooms',
    description: 'The nearest flowers are far away! Bees need to carry lots of pollen per trip.',
    emoji: '🌸',
    dangerousTrait: 'pollenCapacity',
    traitDirection: 'low'
  },
  {
    id: 'foggy_weather',
    name: 'Foggy Weather',
    description: 'Dense fog makes it hard to find food! Good waggle dancers can share directions.',
    emoji: '🌫️',
    dangerousTrait: 'waggleDance',
    traitDirection: 'low'
  }
];

export interface BeePopulationStats {
  generation: number;
  averageTraits: BeeTraits;
  populationSize: number;
  event?: BeeEnvironmentEvent;
}
