import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Returns performance-scaled values based on device capability.
 */
export function useDevicePerformance() {
  const isMobile = useIsMobile();

  return useMemo(
    () => ({
      isMobile,
      particleCount: isMobile ? 800 : 3000,
      bloomIntensity: isMobile ? 0.8 : 1.2,
      dpr: isMobile ? [1, 1.5] as [number, number] : [1, 2] as [number, number],
    }),
    [isMobile],
  );
}
