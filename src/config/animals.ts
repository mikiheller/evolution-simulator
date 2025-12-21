// Animal Database Configuration
// To add a new animal, just add an entry here - no other code changes needed!

export interface TraitConfig {
  id: string;
  name: string;
  emoji: string;
  // Optional: if true, LOW values are good (like size for bunnies needing less food)
  lowIsGood?: boolean;
}

export interface EventConfig {
  id: string;
  name: string;
  description: string;
  emoji: string;
  dangerousTrait: string; // Must match a trait id
  traitDirection: 'low' | 'high'; // 'low' = low trait values are dangerous
}

export interface AnimalTheme {
  primary: string;      // Main accent color
  secondary: string;    // Text/darker accent
  background: string;   // CSS gradient or color
  cardBg: string;       // Card background
  cardBorder: string;   // Card border color
}

export interface AnimalConfig {
  id: string;
  name: string;           // Display name (e.g., "Arctic Bunnies")
  singular: string;       // Singular form (e.g., "bunny")
  plural: string;         // Plural form (e.g., "bunnies")
  emoji: string;          // Main emoji
  environment: {
    name: string;         // e.g., "Arctic Tundra"
    emoji: string;        // e.g., "❄️"
  };
  theme: AnimalTheme;
  traits: TraitConfig[];
  events: EventConfig[];
  names: string[];        // Pool of names for this animal
  // Visual customization
  visualStyle: 'bunny' | 'elephant' | 'bee' | 'generic';
}

// ============================================================================
// ANIMAL DEFINITIONS
// ============================================================================

export const animals: Record<string, AnimalConfig> = {
  // ---------------------------------------------------------------------------
  // ARCTIC BUNNIES
  // ---------------------------------------------------------------------------
  bunny: {
    id: 'bunny',
    name: 'Arctic Bunnies',
    singular: 'bunny',
    plural: 'bunnies',
    emoji: '🐰',
    environment: {
      name: 'Arctic Tundra',
      emoji: '❄️',
    },
    theme: {
      primary: '#60a5fa',
      secondary: '#1e3a5f',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #334155 100%)',
      cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      cardBorder: '#60a5fa',
    },
    traits: [
      { id: 'furThickness', name: 'Fur Warmth', emoji: '🧥' },
      { id: 'speed', name: 'Speed', emoji: '⚡' },
      { id: 'size', name: 'Size', emoji: '📏', lowIsGood: true },
      { id: 'camouflage', name: 'Camouflage', emoji: '👻' },
    ],
    events: [
      {
        id: 'harsh_winter',
        name: 'Harsh Winter',
        description: 'A super cold winter! Bunnies with thin fur might freeze.',
        emoji: '❄️',
        dangerousTrait: 'furThickness',
        traitDirection: 'low',
      },
      {
        id: 'wolf_pack',
        name: 'Wolf Pack',
        description: 'Hungry wolves are hunting! Slow bunnies are in danger.',
        emoji: '🐺',
        dangerousTrait: 'speed',
        traitDirection: 'low',
      },
      {
        id: 'eagle_attack',
        name: 'Eagle Attack',
        description: 'Eagles circle above! Bunnies that stand out get spotted.',
        emoji: '🦅',
        dangerousTrait: 'camouflage',
        traitDirection: 'low',
      },
      {
        id: 'food_shortage',
        name: 'Food Shortage',
        description: "Not much food this year! Big bunnies need more to survive.",
        emoji: '🥬',
        dangerousTrait: 'size',
        traitDirection: 'high',
      },
    ],
    names: [
      'Snowball', 'Frosty', 'Fluffy', 'Cotton', 'Marshmallow',
      'Blizzard', 'Ice', 'Powder', 'Crystal', 'Winter',
      'Snowy', 'Frost', 'Cloud', 'Whiskers', 'Hopper',
      'Thumper', 'Biscuit', 'Nibbles', 'Patches', 'Clover',
      'Pepper', 'Ginger', 'Cocoa', 'Peanut', 'Cookie',
      'Maple', 'Honey', 'Berry', 'Daisy', 'Luna',
      'Star', 'Moon', 'Sky', 'Storm', 'Thunder',
      'Willow', 'Sage', 'Basil', 'Mint', 'Rosie',
    ],
    visualStyle: 'bunny',
  },

  // ---------------------------------------------------------------------------
  // AFRICAN ELEPHANTS
  // ---------------------------------------------------------------------------
  elephant: {
    id: 'elephant',
    name: 'African Elephants',
    singular: 'elephant',
    plural: 'elephants',
    emoji: '🐘',
    environment: {
      name: 'African Savanna',
      emoji: '☀️',
    },
    theme: {
      primary: '#f59e0b',
      secondary: '#78350f',
      background: 'linear-gradient(180deg, #fef3c7 0%, #fcd34d 30%, #d97706 70%, #92400e 100%)',
      cardBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      cardBorder: '#f59e0b',
    },
    traits: [
      { id: 'tuskSize', name: 'Tusk Size', emoji: '🦷' },
      { id: 'memory', name: 'Memory', emoji: '🧠' },
      { id: 'trunkStrength', name: 'Trunk Strength', emoji: '💪' },
      { id: 'hearing', name: 'Hearing', emoji: '👂' },
    ],
    events: [
      {
        id: 'drought',
        name: 'Severe Drought',
        description: 'Water is scarce! Elephants who remember where to find water will survive.',
        emoji: '☀️',
        dangerousTrait: 'memory',
        traitDirection: 'low',
      },
      {
        id: 'poachers',
        name: 'Poacher Threat',
        description: 'Dangerous poachers are nearby! Elephants with big tusks are targets.',
        emoji: '🎯',
        dangerousTrait: 'tuskSize',
        traitDirection: 'high',
      },
      {
        id: 'lion_pride',
        name: 'Lion Pride Attack',
        description: 'A pride of lions is hunting! Elephants need strong tusks to defend themselves.',
        emoji: '🦁',
        dangerousTrait: 'tuskSize',
        traitDirection: 'low',
      },
      {
        id: 'long_migration',
        name: 'Long Migration',
        description: 'The herd must travel far! Elephants need strong trunks to forage along the way.',
        emoji: '🚶',
        dangerousTrait: 'trunkStrength',
        traitDirection: 'low',
      },
    ],
    names: [
      'Tembo', 'Dumbo', 'Ellie', 'Tusker', 'Jumbo',
      'Peanut', 'Trunk', 'Stompy', 'Biggie', 'Gentle',
      'Savanna', 'Dusty', 'Rumble', 'Thunder', 'Storm',
      'Babar', 'Celeste', 'Flora', 'Zephyr', 'Atlas',
      'Titan', 'Mammoth', 'Goliath', 'Hercules', 'Samson',
      'Nala', 'Simba', 'Kali', 'Raja', 'Sultan',
      'Sahara', 'Serengeti', 'Kilimanjaro', 'Zambezi', 'Congo',
      'Marula', 'Acacia', 'Baobab', 'Thorn', 'Ivory',
    ],
    visualStyle: 'elephant',
  },

  // ---------------------------------------------------------------------------
  // BUSY BEES
  // ---------------------------------------------------------------------------
  bee: {
    id: 'bee',
    name: 'Busy Bees',
    singular: 'bee',
    plural: 'bees',
    emoji: '🐝',
    environment: {
      name: 'Flower Meadow',
      emoji: '🌻',
    },
    theme: {
      primary: '#fbbf24',
      secondary: '#78350f',
      background: 'linear-gradient(180deg, #fef9c3 0%, #fef3c7 50%, #fed7aa 100%)',
      cardBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      cardBorder: '#fbbf24',
    },
    traits: [
      { id: 'waggleDance', name: 'Waggle Dance', emoji: '🕺' },
      { id: 'pollenCapacity', name: 'Pollen Capacity', emoji: '🧺' },
      { id: 'navigation', name: 'Navigation', emoji: '🗺️' },
      { id: 'stingDefense', name: 'Sting Defense', emoji: '⚔️' },
    ],
    events: [
      {
        id: 'pesticide',
        name: 'Pesticide Exposure',
        description: 'Toxic chemicals in the fields! Bees with poor navigation might not avoid contaminated areas.',
        emoji: '☠️',
        dangerousTrait: 'navigation',
        traitDirection: 'low',
      },
      {
        id: 'bear_attack',
        name: 'Bear Attack',
        description: 'A hungry bear is after the honey! Bees need strong stings to defend the hive.',
        emoji: '🐻',
        dangerousTrait: 'stingDefense',
        traitDirection: 'low',
      },
      {
        id: 'distant_blooms',
        name: 'Distant Blooms',
        description: 'The nearest flowers are far away! Bees need to carry lots of pollen per trip.',
        emoji: '🌸',
        dangerousTrait: 'pollenCapacity',
        traitDirection: 'low',
      },
      {
        id: 'foggy_weather',
        name: 'Foggy Weather',
        description: 'Dense fog makes it hard to find food! Good waggle dancers can share directions.',
        emoji: '🌫️',
        dangerousTrait: 'waggleDance',
        traitDirection: 'low',
      },
    ],
    names: [
      'Buzz', 'Honey', 'Sunny', 'Nectar', 'Blossom',
      'Clover', 'Daisy', 'Petal', 'Bumble', 'Ziggy',
      'Stripe', 'Golden', 'Amber', 'Marigold', 'Poppy',
      'Buttercup', 'Dandy', 'Flora', 'Jasmine', 'Lily',
      'Rose', 'Tulip', 'Violet', 'Wisteria', 'Zinnia',
      'Buzzy', 'Humming', 'Zippy', 'Zoom', 'Flash',
      'Spark', 'Ray', 'Beam', 'Glow', 'Shimmer',
      'Glitter', 'Sparkle', 'Twinkle', 'Star', 'Meadow',
    ],
    visualStyle: 'bee',
  },
};

// Helper to get animal config by ID
export function getAnimalConfig(animalId: string): AnimalConfig | undefined {
  return animals[animalId];
}

// Get all animal IDs
export function getAnimalIds(): string[] {
  return Object.keys(animals);
}

// Get all animals as array
export function getAllAnimals(): AnimalConfig[] {
  return Object.values(animals);
}
