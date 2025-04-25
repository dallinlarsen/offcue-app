import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ChevronRightIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getAllSchedules } from "@/lib/schedules/schedules.service";
import { Schedule } from "@/lib/schedules/schedules.types";
import { formatScheduleString } from "@/lib/utils/format";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { TouchableOpacity } from "react-native";

export default function SchedulesScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const loadSchedules = async () => {
    const data = await getAllSchedules();
    setSchedules(data);
  };

  // Refresh reminders whenever the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [])
  );

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center mb-4">
        <Heading size="3xl">Schedules</Heading>
      </Box>
      <VStack space="md">
        {schedules.map((schedule) => (
          <Card key={schedule.id} variant="filled">
            <TouchableOpacity className="">
              <HStack className="justify-between items-center flex-wrap">
                <HStack className="items-end flex-wrap">
                  <Text
                    numberOfLines={1}
                    size="xl"
                    className="font-semibold"
                  >
                    {schedule.label || "No Label"}
                  </Text>
                  <Text className="ml-2">{formatScheduleString(schedule)}</Text>
                  <Box className="flex-1" />
                  <Icon as={ChevronRightIcon} />
                </HStack>
              </HStack>
            </TouchableOpacity>
          </Card>
        ))}
      </VStack>
    </ThemedContainer>
  );
}
