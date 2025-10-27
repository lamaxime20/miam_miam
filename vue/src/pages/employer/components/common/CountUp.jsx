import React, { useEffect, useState } from 'react';

function CountUp({ end = 0, duration = 800 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const next = Math.floor(start + (end - start) * progress);
      setValue(next);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);

  return <span>{value.toLocaleString()}</span>;
}

export default CountUp;
