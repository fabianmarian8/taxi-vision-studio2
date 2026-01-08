import React from 'react';

interface GeometricLinesProps {
  variant?: 'hero' | 'section' | 'subtle';
  count?: number;
}

export const GeometricLines: React.FC<GeometricLinesProps> = ({ 
  variant = 'section',
  count = 8 
}) => {
  const getLineStyle = (index: number) => {
    const baseStyles = {
      hero: {
        width: '4px',
        opacity: 0.12,
        rotation: -20 + index * 5,
        length: '120%',
      },
      section: {
        width: '3px',
        opacity: 0.08,
        rotation: -15 + index * 4,
        length: '100%',
      },
      subtle: {
        width: '2px',
        opacity: 0.05,
        rotation: -10 + index * 3,
        length: '80%',
      },
    };

    const config = baseStyles[variant];
    
    return {
      left: `${(index + 1) * (100 / (count + 1))}%`,
      width: config.width,
      height: config.length,
      opacity: config.opacity,
      transform: `
        perspective(1200px) 
        rotateZ(${config.rotation}deg) 
        rotateX(${Math.sin(index) * 5}deg)
        translateZ(${index * 2}px)
      `,
      transition: 'transform 0.6s ease-in-out',
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="geometric-line absolute top-0"
          style={getLineStyle(i)}
        />
      ))}
    </div>
  );
};
