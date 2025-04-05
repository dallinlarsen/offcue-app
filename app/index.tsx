import { useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";


export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  
  return (
    <ThemedContainer>
      <Box>
        <Heading size="3xl">Reminders</Heading>
      </Box>
      <Fab
        size="lg"
        placement="bottom center"
        onPress={() => router.push("/new-reminder")}
      >
        <FabIcon size='xl' as={AddIcon} />
      </Fab>
    </ThemedContainer>
  );
}
