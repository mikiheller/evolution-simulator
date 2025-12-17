import { useEffect, useState } from 'react';
import './Snowfall.css';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  opacity: number;
  delay: number;
}

export function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  
  useEffect(() => {
    const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      size: 3 + Math.random() * 8,
      opacity: 0.3 + Math.random() * 0.7,
      delay: Math.random() * 5
    }));
    setSnowflakes(flakes);
  }, []);
  
  return (
    <div className="snowfall">
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animationDelay: `${flake.delay}s`
          }}
        />
      ))}
    </div>
  );
}

