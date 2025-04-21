import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";

export default function SchedulesScreen() {
  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center mb-4">
        <Heading size="3xl">Schedules</Heading>
      </Box>
    </ThemedContainer>
  );
}
