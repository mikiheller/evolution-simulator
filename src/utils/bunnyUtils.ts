import type { Bunny, BunnyTraits } from '../types/bunny';

// Cute bunny names for kids
const BUNNY_NAMES = [
  'Snowball', 'Frosty', 'Fluffy', 'Cotton', 'Marshmallow',
  'Blizzard', 'Ice', 'Powder', 'Crystal', 'Winter',
  'Snowy', 'Frost', 'Cloud', 'Whiskers', 'Hopper',
  'Thumper', 'Biscuit', 'Nibbles', 'Patches', 'Clover',
  'Pepper', 'Ginger', 'Cocoa', 'Peanut', 'Cookie',
  'Maple', 'Honey', 'Berry', 'Daisy', 'Luna',
  'Star', 'Moon', 'Sky', 'Storm', 'Thunder',
  'Willow', 'Sage', 'Basil', 'Mint', 'Rosie'
];

let bunnyCounter = 0;

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
  return `bunny-${Date.now()}-${bunnyCounter++}`;
}

// Get a random name
function getRandomName(): string {
  return BUNNY_NAMES[Math.floor(Math.random() * BUNNY_NAMES.length)];
}

// Create a new random bunny
// TUNED FOR KIDS: Wider initial spread so selection is dramatic!
export function createRandomBunny(generation: number = 1): Bunny {
  return {
    id: generateId(),
    name: getRandomName(),
    traits: {
      // Start with wide spread (variance 22) so some bunnies are clearly better/worse
      furThickness: randomTrait(50, 22),
      speed: randomTrait(50, 22),
      size: randomTrait(50, 22),
      camouflage: randomTrait(50, 22)
    },
    generation,
    isAlive: true
  };
}

// Create offspring from a parent bunny with inherited traits + variation
// TUNED FOR KIDS: Tighter inheritance so evolution is clearly visible!
export function createOffspring(parent: Bunny, generation: number): Bunny {
  const mutationChance = 0.15; // 15% chance for mutation (was 30%)
  const normalVariance = 5;    // Tight inheritance - kids stay close to parents (was 8)
  const mutationVariance = 12; // Smaller mutations (was 20)
  
  const inheritTrait = (parentValue: number): number => {
    const isMutation = Math.random() < mutationChance;
    const variance = isMutation ? mutationVariance : normalVariance;
    return randomTrait(parentValue, variance);
  };
  
  return {
    id: generateId(),
    name: getRandomName(),
    traits: {
      furThickness: inheritTrait(parent.traits.furThickness),
      speed: inheritTrait(parent.traits.speed),
      size: inheritTrait(parent.traits.size),
      camouflage: inheritTrait(parent.traits.camouflage)
    },
    generation,
    isAlive: true,
    parentId: parent.id
  };
}

// Create initial population
export function createInitialPopulation(size: number = 12): Bunny[] {
  return Array.from({ length: size }, () => createRandomBunny(1));
}

// Calculate average traits of a population
export function calculateAverageTraits(bunnies: Bunny[]): BunnyTraits {
  const aliveBunnies = bunnies.filter(b => b.isAlive);
  if (aliveBunnies.length === 0) {
    return { furThickness: 0, speed: 0, size: 0, camouflage: 0 };
  }
  
  const sum = aliveBunnies.reduce(
    (acc, bunny) => ({
      furThickness: acc.furThickness + bunny.traits.furThickness,
      speed: acc.speed + bunny.traits.speed,
      size: acc.size + bunny.traits.size,
      camouflage: acc.camouflage + bunny.traits.camouflage
    }),
    { furThickness: 0, speed: 0, size: 0, camouflage: 0 }
  );
  
  return {
    furThickness: Math.round(sum.furThickness / aliveBunnies.length),
    speed: Math.round(sum.speed / aliveBunnies.length),
    size: Math.round(sum.size / aliveBunnies.length),
    camouflage: Math.round(sum.camouflage / aliveBunnies.length)
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
export function getTraitEmoji(trait: keyof BunnyTraits): string {
  switch (trait) {
    case 'furThickness': return '🧥';
    case 'speed': return '⚡';
    case 'size': return '📏';
    case 'camouflage': return '👻';
  }
}

// Get trait display name
export function getTraitName(trait: keyof BunnyTraits): string {
  switch (trait) {
    case 'furThickness': return 'Fur Warmth';
    case 'speed': return 'Speed';
    case 'size': return 'Size';
    case 'camouflage': return 'Camouflage';
  }
}

