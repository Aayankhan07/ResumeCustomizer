'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

interface RollingCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function RollingCounter({
  from = 0,
  to,
  duration = 1.6,
  suffix = '',
  className = '',
}: RollingCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  const motionVal = useMotionValue(from);
  const springVal = useSpring(motionVal, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    if (inView) {
      motionVal.set(to);
    }
  }, [inView, motionVal, to]);

  useEffect(() => {
    return springVal.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.floor(latest).toLocaleString()}${suffix}`;
      }
    });
  }, [springVal, suffix]);

  return (
    <span ref={ref} className={className}>
      {from.toLocaleString()}
      {suffix}
    </span>
  );
}
