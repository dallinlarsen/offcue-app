import { StyleSheet } from "react-native";

import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";

export default function HomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  
  return (
    <ThemedContainer>
      <Heading size="3xl">Reminders</Heading>
    </ThemedContainer>
  );
}
