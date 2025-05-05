import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";

/**
 * Returns true if the device likely has a physical home button (e.g., Touch ID).
 * Uses bottom safe area inset to infer presence of gesture-based navigation.
 */
export function useHasHomeButton(): boolean {
  const insets = useSafeAreaInsets();

  const hasHomeButton = useMemo(() => {
    // Devices with gesture navigation typically have a bottom inset > 0
    return insets.bottom === 0;
  }, [insets.bottom]);

  return hasHomeButton;
}
