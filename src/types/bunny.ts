export interface BunnyTraits {
  furThickness: number;
  speed: number;
  size: number;
  camouflage: number;
}

export interface Bunny {
  id: string;
  name: string;
  traits: BunnyTraits;
  generation: number;
  isAlive: boolean;
  parentId?: string;
}

export type EnvironmentEvent = 
  | 'harsh_winter'
  | 'wolf_pack'
  | 'eagle_attack'
  | 'food_shortage'
  | 'mild_year';

export interface EnvironmentEventInfo {
  id: EnvironmentEvent;
  name: string;
  description: string;
  emoji: string;
  dangerousTrait: keyof BunnyTraits;
  traitDirection: 'low' | 'high';
}

export const ENVIRONMENT_EVENTS: EnvironmentEventInfo[] = [
  {
    id: 'harsh_winter',
    name: 'Harsh Winter',
    description: 'A super cold winter! Bunnies with thin fur might freeze.',
    emoji: '❄️',
    dangerousTrait: 'furThickness',
    traitDirection: 'low'
  },
  {
    id: 'wolf_pack',
    name: 'Wolf Pack',
    description: 'Hungry wolves are hunting! Slow bunnies are in danger.',
    emoji: '🐺',
    dangerousTrait: 'speed',
    traitDirection: 'low'
  },
  {
    id: 'eagle_attack',
    name: 'Eagle Attack',
    description: 'Eagles circle above! Bunnies that stand out get spotted.',
    emoji: '🦅',
    dangerousTrait: 'camouflage',
    traitDirection: 'low'
  },
  {
    id: 'food_shortage',
    name: 'Food Shortage',
    description: 'Not much food this year! Big bunnies need more to survive.',
    emoji: '🥬',
    dangerousTrait: 'size',
    traitDirection: 'high'
  },
  {
    id: 'mild_year',
    name: 'Mild Year',
    description: 'A peaceful year! Most bunnies will be just fine.',
    emoji: '☀️',
    dangerousTrait: 'furThickness',
    traitDirection: 'low'
  }
];

export interface PopulationStats {
  generation: number;
  averageTraits: BunnyTraits;
  populationSize: number;
  event?: EnvironmentEvent;
}

