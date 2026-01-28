"use client"
import { useEffect, useState } from "react";

export function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }
    
    let startTime: number | null = null;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Ease-out function
      const easeOutPercentage = 1 - Math.pow(1 - percentage, 3);
      
      setCount(Math.floor(value * easeOutPercentage));

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Cleanup function to avoid memory leaks
    return () => {
      startTime = null;
    }
  }, [value]);
  
  return <span className="font-bold">{count.toLocaleString('en-IN')}</span>;
}
