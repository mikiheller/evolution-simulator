import type { Bee, BeeTraits } from '../types/bee';

// Cute bee names for kids - expanded list to reduce duplicates
const BEE_NAMES = [
  'Buzz', 'Honey', 'Sunny', 'Nectar', 'Blossom',
  'Clover', 'Daisy', 'Petal', 'Bumble', 'Ziggy',
  'Stripe', 'Golden', 'Amber', 'Marigold', 'Poppy',
  'Buttercup', 'Dandy', 'Flora', 'Jasmine', 'Lily',
  'Rose', 'Tulip', 'Violet', 'Wisteria', 'Zinnia',
  'Buzzy', 'Humming', 'Zippy', 'Zoom', 'Flash',
  'Spark', 'Sunny', 'Ray', 'Beam', 'Glow',
  'Shimmer', 'Glitter', 'Sparkle', 'Twinkle', 'Star',
  'Meadow', 'Garden', 'Field', 'Grove', 'Orchard',
  'Willow', 'Sage', 'Basil', 'Mint', 'Thyme',
  'Cinnamon', 'Ginger', 'Nutmeg', 'Saffron', 'Vanilla',
  'Caramel', 'Toffee', 'Maple', 'Syrup', 'Sugar',
  'Cookie', 'Biscuit', 'Muffin', 'Cupcake', 'Truffle',
  'Pollen', 'Stinger', 'Wings', 'Fuzzy', 'Fluffy',
  'Buzzbee', 'Honeydew', 'Sunflower', 'Bluebell', 'Primrose'
];

let beeCounter = 0;
let usedNames: Set<string> = new Set();

// Reset used names (call when starting new game)
export function resetUsedNames(): void {
  usedNames = new Set();
}

// Generate a random trait value with a bell curve distribution around a mean
function randomTrait(mean: number = 50, variance: number = 20): number {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  let value = mean + z * variance;
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(value)));
}

// Generate a unique ID
function generateId(): string {
  return `bee-${Date.now()}-${beeCounter++}`;
}

// Get a unique random name
function getRandomName(): string {
  // Get available names (not yet used)
  const availableNames = BEE_NAMES.filter(name => !usedNames.has(name));
  
  // If all names used, reset and start fresh
  if (availableNames.length === 0) {
    usedNames.clear();
    return getRandomName();
  }
  
  const name = availableNames[Math.floor(Math.random() * availableNames.length)];
  usedNames.add(name);
  return name;
}

// Create a new random bee
// TUNED FOR KIDS: Wider initial spread so selection is dramatic!
export function createRandomBee(generation: number = 1): Bee {
  return {
    id: generateId(),
    name: getRandomName(),
    traits: {
      // Start with wide spread (variance 22) so some bees are clearly better/worse
      waggleDance: randomTrait(50, 22),
      pollenCapacity: randomTrait(50, 22),
      navigation: randomTrait(50, 22),
      stingDefense: randomTrait(50, 22)
    },
    generation,
    isAlive: true
  };
}

// Create offspring from a parent bee with inherited traits + variation
// TUNED FOR KIDS: Very tight inheritance so evolution is clearly visible!
export function createOffspring(parent: Bee, generation: number): Bee {
  const mutationChance = 0.10; // 10% chance for mutation - rare!
  const normalVariance = 3;    // Very tight - kids are almost like parents
  const mutationVariance = 8;  // Even mutations are small
  
  const inheritTrait = (parentValue: number): number => {
    const isMutation = Math.random() < mutationChance;
    const variance = isMutation ? mutationVariance : normalVariance;
    return randomTrait(parentValue, variance);
  };
  
  return {
    id: generateId(),
    name: getRandomName(),
    traits: {
      waggleDance: inheritTrait(parent.traits.waggleDance),
      pollenCapacity: inheritTrait(parent.traits.pollenCapacity),
      navigation: inheritTrait(parent.traits.navigation),
      stingDefense: inheritTrait(parent.traits.stingDefense)
    },
    generation,
    isAlive: true,
    parentId: parent.id
  };
}

// Create initial population
export function createInitialPopulation(size: number = 12): Bee[] {
  return Array.from({ length: size }, () => createRandomBee(1));
}

// Calculate average traits of a population
export function calculateAverageTraits(bees: Bee[]): BeeTraits {
  const aliveBees = bees.filter(b => b.isAlive);
  if (aliveBees.length === 0) {
    return { waggleDance: 0, pollenCapacity: 0, navigation: 0, stingDefense: 0 };
  }
  
  const sum = aliveBees.reduce(
    (acc, bee) => ({
      waggleDance: acc.waggleDance + bee.traits.waggleDance,
      pollenCapacity: acc.pollenCapacity + bee.traits.pollenCapacity,
      navigation: acc.navigation + bee.traits.navigation,
      stingDefense: acc.stingDefense + bee.traits.stingDefense
    }),
    { waggleDance: 0, pollenCapacity: 0, navigation: 0, stingDefense: 0 }
  );
  
  return {
    waggleDance: Math.round(sum.waggleDance / aliveBees.length),
    pollenCapacity: Math.round(sum.pollenCapacity / aliveBees.length),
    navigation: Math.round(sum.navigation / aliveBees.length),
    stingDefense: Math.round(sum.stingDefense / aliveBees.length)
  };
}

// Get trait rating for display
export function getTraitRating(value: number): { label: string; color: string } {
  if (value >= 80) return { label: 'Amazing!', color: '#22c55e' };
  if (value >= 60) return { label: 'Good', color: '#84cc16' };
  if (value >= 40) return { label: 'Average', color: '#eab308' };
  if (value >= 20) return { label: 'Poor', color: '#f97316' };
  return { label: 'Weak', color: '#ef4444' };
}

// Get trait emoji
export function getTraitEmoji(trait: keyof BeeTraits): string {
  switch (trait) {
    case 'waggleDance': return '🕺';
    case 'pollenCapacity': return '🧺';
    case 'navigation': return '🗺️';
    case 'stingDefense': return '⚔️';
  }
}

// Get trait display name
export function getTraitName(trait: keyof BeeTraits): string {
  switch (trait) {
    case 'waggleDance': return 'Waggle Dance';
    case 'pollenCapacity': return 'Pollen Capacity';
    case 'navigation': return 'Navigation';
    case 'stingDefense': return 'Sting Defense';
  }
}
