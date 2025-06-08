import { ReactNode, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function ({ children }: { children: ReactNode }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    const triggerWiggle = () => {
      rotation.value = withSequence(
        withTiming(-5, { duration: 80, easing: Easing.linear }),
        withTiming(5, { duration: 80, easing: Easing.linear }),
        withTiming(-3, { duration: 60, easing: Easing.linear }),
        withTiming(3, { duration: 60, easing: Easing.linear }),
        withTiming(0, { duration: 60, easing: Easing.linear })
      );
    };

    const timeout = setTimeout(() => {
      triggerWiggle();
      const interval = setInterval(triggerWiggle, 10000); // every 10 sec
      // clear interval on unmount
      return () => clearInterval(interval);
    }, 5000); // wait 5 seconds on mount

    // clear timeout on unmount
    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
