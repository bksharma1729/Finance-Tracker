import { useEffect, useState } from "react";

export function useAnimatedNumber(target, duration = 800, isActive = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isActive || (typeof target !== "number" && !target)) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const startVal = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration, isActive]);

  return value;
}
