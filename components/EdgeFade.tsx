import { LinearGradient } from "expo-linear-gradient";
import { Box } from "./ui/box";
import { StyleSheet } from "react-native";
import { ReactNode } from "react";

type Props = {
  left?: boolean;
  children?: ReactNode;
  className?: string;
};

export default function EdgeFadeOverlay({ left, children, className }: Props) {
  const LIGHT_COLORS = [
    "rgba(251, 251, 251, 0)",
    "rgba(251, 251, 251, .5)",
    "rgba(251, 251, 251, .7)",
    "rgba(251, 251, 251, .9)",
    "rgba(251, 251, 251, 1)",
  ];

  const DARK_COLORS = [
    "rgba(24, 23, 25, 0)",
    "rgba(24, 23, 25, .5)",
    "rgba(24, 23, 25, .7)",
    "rgba(24, 23, 25, .9)",
    "rgba(24, 23, 25, 1)",
  ];

  return (
    <>
      <Box
        className={`absolute top-0 bottom-0 ${
          left ? "left-0" : "right-0"
        } w-4 h-0 dark:h-8 ${className ? className : ""}`}
        pointerEvents="none"
      >
        <LinearGradient
          /* @ts-ignore */
          colors={left ? DARK_COLORS.reverse() : DARK_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sideFade}
        >
          {children}
        </LinearGradient>
      </Box>
      <Box
        className={`absolute top-0 bottom-0 ${
          left ? "left-0" : "right-0"
        } w-4 dark:h-0`}
        pointerEvents="none"
      >
        <LinearGradient
          /* @ts-ignore */
          colors={left ? LIGHT_COLORS.reverse() : LIGHT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sideFade}
        >
          {children}
        </LinearGradient>
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  sideFade: {
    flex: 1,
  },
});
