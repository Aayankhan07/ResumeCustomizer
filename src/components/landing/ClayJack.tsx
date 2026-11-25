'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ClayJackProps {
  color?: 'coral' | 'white' | 'blue';
  size?: number;
  className?: string;
  delay?: number;
  rotateOffset?: number;
}

export const ClayJack: React.FC<ClayJackProps> = ({
  color = 'coral',
  size = 140,
  className = '',
  delay = 0,
  rotateOffset = 0,
}) => {
  // Ultra-tactile smooth clay gradients with subsurface scattering feel
  const getGradients = () => {
    switch (color) {
      case 'white':
        return {
          id: 'clay-white',
          main: '#F3F4F6',
          highlight: '#FFFFFF',
          shadow: '#CBD5E1',
          ambientShadow: 'rgba(100, 116, 139, 0.28)',
          glow: 'rgba(255, 255, 255, 0.8)',
        };
      case 'blue':
        return {
          id: 'clay-blue',
          main: '#2563EB',
          highlight: '#60A5FA',
          shadow: '#1E40AF',
          ambientShadow: 'rgba(37, 99, 235, 0.38)',
          glow: 'rgba(96, 165, 250, 0.5)',
        };
      case 'coral':
      default:
        return {
          id: 'clay-coral',
          main: '#EA580C',
          highlight: '#FB923C',
          shadow: '#9A3412',
          ambientShadow: 'rgba(234, 88, 12, 0.32)',
          glow: 'rgba(251, 146, 60, 0.5)',
        };
    }
  };

  const reduceMotion = useReducedMotion();
  const g = getGradients();
  const uid = `${g.id}-${size}-${rotateOffset}`;

  return (
    <motion.div
      aria-hidden="true"
      initial={{ rotate: rotateOffset }}
      animate={
        reduceMotion
          ? { rotate: rotateOffset }
          : {
              y: [-8, 8, -8],
              rotate: [rotateOffset, rotateOffset + 5, rotateOffset - 5, rotateOffset],
            }
      }
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
      }}
      className={`relative select-none pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 26px 36px ${g.ambientShadow})`,
      }}
    >
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Radial light fill mimicking 3D sphere ray-tracing */}
          <radialGradient id={`${uid}-rad`} cx="32%" cy="28%" r="68%" fx="28%" fy="24%">
            <stop offset="0%" stopColor={g.highlight} stopOpacity="1" />
            <stop offset="40%" stopColor={g.main} stopOpacity="1" />
            <stop offset="100%" stopColor={g.shadow} stopOpacity="1" />
          </radialGradient>

          {/* Soft subsurface glow */}
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* 3D Organic Smooth Rounded Cross Structure */}
        <g transform="rotate(45 120 120)">
          {/* Base shadow layer */}
          <rect
            x="32"
            y="88"
            width="176"
            height="64"
            rx="32"
            fill={g.shadow}
            opacity="0.3"
            transform="translate(4, 6)"
          />
          <rect
            x="88"
            y="32"
            width="64"
            height="176"
            rx="32"
            fill={g.shadow}
            opacity="0.3"
            transform="translate(4, 6)"
          />

          {/* Horizontal Pill Bar */}
          <rect x="32" y="88" width="176" height="64" rx="32" fill={`url(#${uid}-rad)`} />
          {/* Vertical Pill Bar */}
          <rect x="88" y="32" width="64" height="176" rx="32" fill={`url(#${uid}-rad)`} />

          {/* Center blending node for seamless metaball effect */}
          <circle cx="120" cy="120" r="40" fill={`url(#${uid}-rad)`} />

          {/* Specular gloss highlight 1 */}
          <ellipse
            cx="106"
            cy="104"
            rx="24"
            ry="14"
            transform="rotate(-25 106 104)"
            fill="#FFFFFF"
            fillOpacity="0.55"
            filter={`url(#${uid}-soft)`}
          />
          {/* Specular pin-light 2 */}
          <circle cx="98" cy="98" r="6" fill="#FFFFFF" fillOpacity="0.8" />
        </g>
      </svg>
    </motion.div>
  );
};
