import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center mb-4">
        <Heading size="3xl">Settings</Heading>
      </Box>
      <Button size="xl" onPress={() => router.push('/settings/notifications-test')}>
        <ButtonText>Notifications Testing</ButtonText>
      </Button>
    </ThemedContainer>
  );
}
