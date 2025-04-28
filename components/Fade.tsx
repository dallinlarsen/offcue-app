import { LinearGradient } from "expo-linear-gradient";
import { Box } from "./ui/box";
import { StyleSheet } from "react-native";

type Props = {
    heightClassLight?: string
    heightClassDark?: string
    className?: string
    reverse?: boolean
}

export default function ({ heightClassLight, heightClassDark, className, reverse }: Props) {
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
        className={`absolute bottom-0 right-0 left-0 ${
          heightClassLight ? heightClassLight : "h-28"
        } dark:h-0 ${className}`}
        pointerEvents="none"
      >
        <LinearGradient
          pointerEvents="none"
          //@ts-ignore
          colors={reverse ? LIGHT_COLORS.reverse() : LIGHT_COLORS}
          style={styles.background}
        />
      </Box>
      <Box
        className={`absolute bottom-0 right-0 left-0 h-0 ${
          heightClassDark ? heightClassDark : "dark:h-28"
        } ${className}`}
        pointerEvents="none"
      >
        <LinearGradient
          pointerEvents="none"
          //@ts-ignore
          colors={reverse ? DARK_COLORS.reverse() : DARK_COLORS}
          style={styles.background}
        />
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});
