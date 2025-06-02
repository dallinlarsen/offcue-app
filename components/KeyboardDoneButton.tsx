import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { Button, ButtonText } from "./ui/button";
import { Box } from "./ui/box";
import { Portal } from "./ui/portal";

export default function KeyboardDoneButton() {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start(() => {
        setVisible(false); // hide after animation completes
        setKeyboardHeight(0);
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!visible || Platform.OS !== "ios") return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0], // slides in from 40px below
  });

  return (
    <Portal isOpen={true}>
      <Animated.View
        className="absolute w-full h-12 flex flex-row bg-background-100"
        style={[
          {
            bottom: keyboardHeight,
            transform: [{ translateY }],
          },
        ]}
      >
        <Box className="flex-1"></Box>
        <Button
          className="px-6 py-2 h-full"
          variant="link"
          size="lg"
          onPress={() => Keyboard.dismiss()}
        >
          <ButtonText>Done</ButtonText>
        </Button>
      </Animated.View>
    </Portal>
  );
}
