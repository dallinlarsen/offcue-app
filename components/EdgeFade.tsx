import { LinearGradient } from "expo-linear-gradient";
import { Box } from "./ui/box";
import { StyleSheet } from "react-native";

type Props = {
  left?: boolean;
};

export default function EdgeFadeOverlay({ left }: Props) {
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
        className={`absolute top-0 bottom-0 ${left ? "left-0" : "right-0"} w-8`}
        pointerEvents="none"
      >
        <LinearGradient
          colors={left ? DARK_COLORS.reverse() : DARK_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sideFade}
        />
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  sideFade: {
    flex: 1,
  },
});
