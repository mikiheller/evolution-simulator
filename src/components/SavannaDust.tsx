import { useEffect, useState } from 'react';
import './SavannaDust.css';

interface DustParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface GrassBlade {
  id: number;
  x: number;
  height: number;
  delay: number;
}

export function SavannaDust() {
  const [particles, setParticles] = useState<DustParticle[]>([]);
  const [grass, setGrass] = useState<GrassBlade[]>([]);

  useEffect(() => {
    // Create dust particles
    const newParticles: DustParticle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
    setParticles(newParticles);

    // Create grass blades
    const newGrass: GrassBlade[] = [];
    for (let i = 0; i < 40; i++) {
      newGrass.push({
        id: i,
        x: Math.random() * 100,
        height: Math.random() * 30 + 20,
        delay: Math.random() * 2
      });
    }
    setGrass(newGrass);
  }, []);

  return (
    <div className="savanna-dust">
      {/* Sun */}
      <div className="savanna-sun" />
      
      {/* Dust particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="dust-particle"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: particle.opacity
          }}
        />
      ))}
      
      {/* Grass at the bottom */}
      <div className="savanna-grass">
        {grass.map(blade => (
          <div
            key={blade.id}
            className="grass-blade"
            style={{
              left: `${blade.x}%`,
              height: blade.height,
              animationDelay: `${blade.delay}s`
            }}
          />
        ))}
      </div>
      
      {/* Acacia tree silhouettes */}
      <div className="acacia-tree tree-1" />
      <div className="acacia-tree tree-2" />
    </div>
  );
}
