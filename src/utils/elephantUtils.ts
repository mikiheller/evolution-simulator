import type { Elephant, ElephantTraits } from '../types/elephant';

// Cute elephant names - expanded list to reduce duplicates
const ELEPHANT_NAMES = [
  'Jumbo', 'Dumbo', 'Ellie', 'Tusker', 'Stomper',
  'Peanut', 'Babar', 'Tantor', 'Horton', 'Ella',
  'Tembo', 'Kibo', 'Zuri', 'Amara', 'Simba',
  'Nala', 'Rafiki', 'Makena', 'Jabari', 'Zola',
  'Thunder', 'Rumble', 'Titan', 'Atlas', 'Goliath',
  'Mammoth', 'Colossus', 'Duke', 'Earl', 'Baron',
  'Princess', 'Queen', 'King', 'Prince', 'Duchess',
  'Savanna', 'Sahara', 'Serengeti', 'Kilimanjaro', 'Zambezi',
  'River', 'Lake', 'Oasis', 'Acacia', 'Baobab',
  'Sunny', 'Dusty', 'Sandy', 'Rocky', 'Muddy',
  'Trumpet', 'Echo', 'Whisper', 'Thunder', 'Storm',
  'Dawn', 'Dusk', 'Twilight', 'Sunset', 'Sunrise',
  'Gentle', 'Mighty', 'Noble', 'Brave', 'Wise',
  'Pearl', 'Ruby', 'Jade', 'Amber', 'Ivory'
];

let elephantCounter = 0;
let usedElephantNames: Set<string> = new Set();

// Reset used names (call when starting new game)
export function resetUsedElephantNames(): void {
  usedElephantNames = new Set();
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
  return `elephant-${Date.now()}-${elephantCounter++}`;
}

// Get a unique random name
function getRandomName(): string {
  // Get available names (not yet used)
  const availableNames = ELEPHANT_NAMES.filter(name => !usedElephantNames.has(name));
  
  // If all names used, reset and start fresh
  if (availableNames.length === 0) {
    usedElephantNames.clear();
    return getRandomName();
  }
  
  const name = availableNames[Math.floor(Math.random() * availableNames.length)];
  usedElephantNames.add(name);
  return name;
}

// Create a new random elephant
// TUNED FOR KIDS: Wider initial spread so selection is dramatic!
export function createRandomElephant(generation: number = 1): Elephant {
  return {
    id: generateId(),
    name: getRandomName(),
    traits: {
      // Start with wide spread (variance 22) so some elephants are clearly better/worse
      tuskSize: randomTrait(50, 22),
      memory: randomTrait(50, 22),
      trunkStrength: randomTrait(50, 22),
      hearing: randomTrait(50, 22)
    },
    generation,
    isAlive: true
  };
}

// Create offspring from a parent elephant with inherited traits + variation
// TUNED FOR KIDS: Very tight inheritance so evolution is clearly visible!
export function createElephantOffspring(parent: Elephant, generation: number): Elephant {
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
      tuskSize: inheritTrait(parent.traits.tuskSize),
      memory: inheritTrait(parent.traits.memory),
      trunkStrength: inheritTrait(parent.traits.trunkStrength),
      hearing: inheritTrait(parent.traits.hearing)
    },
    generation,
    isAlive: true,
    parentId: parent.id
  };
}

// Create initial population
export function createInitialElephantPopulation(size: number = 8): Elephant[] {
  return Array.from({ length: size }, () => createRandomElephant(1));
}

// Calculate average traits of a population
export function calculateAverageElephantTraits(elephants: Elephant[]): ElephantTraits {
  const aliveElephants = elephants.filter(e => e.isAlive);
  if (aliveElephants.length === 0) {
    return { tuskSize: 0, memory: 0, trunkStrength: 0, hearing: 0 };
  }
  
  const sum = aliveElephants.reduce(
    (acc, elephant) => ({
      tuskSize: acc.tuskSize + elephant.traits.tuskSize,
      memory: acc.memory + elephant.traits.memory,
      trunkStrength: acc.trunkStrength + elephant.traits.trunkStrength,
      hearing: acc.hearing + elephant.traits.hearing
    }),
    { tuskSize: 0, memory: 0, trunkStrength: 0, hearing: 0 }
  );
  
  return {
    tuskSize: Math.round(sum.tuskSize / aliveElephants.length),
    memory: Math.round(sum.memory / aliveElephants.length),
    trunkStrength: Math.round(sum.trunkStrength / aliveElephants.length),
    hearing: Math.round(sum.hearing / aliveElephants.length)
  };
}

// Get trait rating for display
// For tusk size: context-dependent (good for defense, bad for poachers)
// For others: high = good
export function getElephantTraitRating(value: number, trait?: keyof ElephantTraits): { label: string; color: string } {
  // Tusk size is special - it can be good or bad depending on context
  // We'll show it as neutral ratings
  if (trait === 'tuskSize') {
    if (value >= 80) return { label: 'Massive!', color: '#a78bfa' };
    if (value >= 60) return { label: 'Large', color: '#818cf8' };
    if (value >= 40) return { label: 'Medium', color: '#60a5fa' };
    if (value >= 20) return { label: 'Small', color: '#38bdf8' };
    return { label: 'Tiny', color: '#22d3d1' };
  }
  
  // Normal traits - high = good
  if (value >= 80) return { label: 'Amazing!', color: '#22c55e' };
  if (value >= 60) return { label: 'Good', color: '#84cc16' };
  if (value >= 40) return { label: 'Average', color: '#eab308' };
  if (value >= 20) return { label: 'Poor', color: '#f97316' };
  return { label: 'Weak', color: '#ef4444' };
}

// Get trait emoji
export function getElephantTraitEmoji(trait: keyof ElephantTraits): string {
  switch (trait) {
    case 'tuskSize': return '🦷';
    case 'memory': return '🧠';
    case 'trunkStrength': return '💪';
    case 'hearing': return '👂';
  }
}

// Get trait display name
export function getElephantTraitName(trait: keyof ElephantTraits): string {
  switch (trait) {
    case 'tuskSize': return 'Tusk Size';
    case 'memory': return 'Memory';
    case 'trunkStrength': return 'Trunk Strength';
    case 'hearing': return 'Hearing';
  }
}
