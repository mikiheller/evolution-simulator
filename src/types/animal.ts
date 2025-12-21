// Generic Animal Types for the Evolution Simulator
// These types work with any animal defined in the config

import type { AnimalConfig, TraitConfig } from '../config/animals';

// Dynamic traits object - keys are trait IDs, values are 0-100
export type AnimalTraits = Record<string, number>;

// A single animal instance
export interface Animal {
  id: string;
  name: string;
  traits: AnimalTraits;
  generation: number;
  isAlive: boolean;
  parentId?: string;
}

// Population statistics for history tracking
export interface PopulationStats {
  generation: number;
  averageTraits: AnimalTraits;
  populationSize: number;
  eventId?: string;
}

// Game phases
export type GamePhase = 'intro' | 'select_event' | 'survival' | 'results' | 'breeding';

// Utility functions for working with animals

// Create initial traits for an animal based on config
export function createRandomTraits(config: AnimalConfig, variance: number = 22): AnimalTraits {
  const traits: AnimalTraits = {};
  for (const trait of config.traits) {
    traits[trait.id] = randomTrait(50, variance);
  }
  return traits;
}

// Inherit traits from a parent with variation
export function inheritTraits(
  parentTraits: AnimalTraits, 
  config: AnimalConfig,
  mutationChance: number = 0.10,
  normalVariance: number = 3,
  mutationVariance: number = 8
): AnimalTraits {
  const traits: AnimalTraits = {};
  for (const trait of config.traits) {
    const isMutation = Math.random() < mutationChance;
    const variance = isMutation ? mutationVariance : normalVariance;
    traits[trait.id] = randomTrait(parentTraits[trait.id], variance);
  }
  return traits;
}

// Calculate average traits across a population
export function calculateAverageTraits(animals: Animal[], config: AnimalConfig): AnimalTraits {
  const aliveAnimals = animals.filter(a => a.isAlive);
  if (aliveAnimals.length === 0) {
    const emptyTraits: AnimalTraits = {};
    for (const trait of config.traits) {
      emptyTraits[trait.id] = 0;
    }
    return emptyTraits;
  }

  const sum: AnimalTraits = {};
  for (const trait of config.traits) {
    sum[trait.id] = 0;
  }

  for (const animal of aliveAnimals) {
    for (const trait of config.traits) {
      sum[trait.id] += animal.traits[trait.id];
    }
  }

  const avg: AnimalTraits = {};
  for (const trait of config.traits) {
    avg[trait.id] = Math.round(sum[trait.id] / aliveAnimals.length);
  }

  return avg;
}

// Get trait rating for display
export function getTraitRating(value: number, trait?: TraitConfig): { label: string; color: string } {
  // If trait has lowIsGood, invert the logic
  if (trait?.lowIsGood) {
    if (value <= 20) return { label: 'Tiny!', color: '#22c55e' };
    if (value <= 40) return { label: 'Small', color: '#84cc16' };
    if (value <= 60) return { label: 'Medium', color: '#eab308' };
    if (value <= 80) return { label: 'Large', color: '#f97316' };
    return { label: 'Huge!', color: '#ef4444' };
  }
  
  // Normal traits - high = good
  if (value >= 80) return { label: 'Amazing!', color: '#22c55e' };
  if (value >= 60) return { label: 'Good', color: '#84cc16' };
  if (value >= 40) return { label: 'Average', color: '#eab308' };
  if (value >= 20) return { label: 'Poor', color: '#f97316' };
  return { label: 'Weak', color: '#ef4444' };
}

// Helper: Generate a random trait value with bell curve distribution
function randomTrait(mean: number = 50, variance: number = 20): number {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  let value = mean + z * variance;
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(value)));
}

// Name management for animals
const usedNames: Map<string, Set<string>> = new Map();

export function resetUsedNames(animalId: string): void {
  usedNames.set(animalId, new Set());
}

export function getRandomName(config: AnimalConfig): string {
  if (!usedNames.has(config.id)) {
    usedNames.set(config.id, new Set());
  }
  
  const used = usedNames.get(config.id)!;
  const available = config.names.filter(name => !used.has(name));
  
  if (available.length === 0) {
    used.clear();
    return getRandomName(config);
  }
  
  const name = available[Math.floor(Math.random() * available.length)];
  used.add(name);
  return name;
}

// Create a new random animal
let animalCounter = 0;

export function createRandomAnimal(config: AnimalConfig, generation: number = 1): Animal {
  return {
    id: `${config.id}-${Date.now()}-${animalCounter++}`,
    name: getRandomName(config),
    traits: createRandomTraits(config),
    generation,
    isAlive: true,
  };
}

// Create offspring from a parent
export function createOffspring(parent: Animal, config: AnimalConfig, generation: number): Animal {
  return {
    id: `${config.id}-${Date.now()}-${animalCounter++}`,
    name: getRandomName(config),
    traits: inheritTraits(parent.traits, config),
    generation,
    isAlive: true,
    parentId: parent.id,
  };
}

// Create initial population
export function createInitialPopulation(config: AnimalConfig, size: number = 8): Animal[] {
  return Array.from({ length: size }, () => createRandomAnimal(config, 1));
}
