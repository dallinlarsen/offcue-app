import { LinearGradient } from "expo-linear-gradient";
import { Box } from "./ui/box";
import { StyleSheet } from "react-native";

type Props = {
    heightClassLight?: string
    heightClassDark?: string
}

export default function ({ heightClassLight, heightClassDark }: Props) {
  return (
    <>
      <Box
        className={`absolute bottom-0 right-0 left-0 ${
          heightClassLight ? heightClassLight : "h-28"
        } dark:h-0`}
        pointerEvents="none"
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(251, 251, 251, 0)",
            "rgba(251, 251, 251, .5)",
            "rgba(251, 251, 251, .7)",
            "rgba(251, 251, 251, .9)",
            "rgba(251, 251, 251, 1)",
          ]}
          style={styles.background}
        />
      </Box>
      <Box
        className={`absolute bottom-0 right-0 left-0 h-0 ${
          heightClassDark ? heightClassDark : "dark:h-28"
        }`}
        pointerEvents="none"
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(24, 23, 25, 0)",
            "rgba(24, 23, 25, .5)",
            "rgba(24, 23, 25, .7)",
            "rgba(24, 23, 25, .9)",
            "rgba(24, 23, 25, 1)",
          ]}
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
