import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { useNavigation } from "expo-router";
import { useEffect } from "react";

export default function SchedulesScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center mb-4">
        <Heading size="3xl">Schedules</Heading>
      </Box>
    </ThemedContainer>
  );
}
