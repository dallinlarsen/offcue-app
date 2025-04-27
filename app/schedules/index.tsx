import Fade from "@/components/Fade";
import AddEditScheduleActionsheet from "@/components/schedule/AddEditScheduleActionsheet";
import ScheduleOption from "@/components/schedule/ScheduleOption";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  AddIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Icon,
} from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getAllSchedules } from "@/lib/schedules/schedules.service";
import { Schedule } from "@/lib/schedules/schedules.types";
import { formatScheduleString } from "@/lib/utils/format";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

export default function SchedulesScreen() {
  const router = useRouter();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);

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
      <ScrollView>
        <VStack space="md">
          {schedules.filter((s) => s.is_archived).length > 0 && (
            <Heading size="xl">Current</Heading>
          )}
          {schedules
            .filter((s) => !s.is_archived)
            .map((schedule) => (
              <ScheduleOption key={schedule.id} schedule={schedule} />
            ))}

          {schedules.filter((s) => s.is_archived).length > 0 && (
            <>
              <TouchableOpacity onPress={() => setShowArchived(!showArchived)}>
                <HStack className="items-center mt-4" space="sm">
                  <Heading size="xl">Archived</Heading>
                  <Icon
                    as={showArchived ? ChevronDownIcon : ChevronRightIcon}
                  />
                </HStack>
              </TouchableOpacity>
              {showArchived &&
                schedules
                  .filter((s) => s.is_archived)
                  .map((schedule) => (
                    <ScheduleOption key={schedule.id} schedule={schedule} />
                  ))}
            </>
          )}
        </VStack>
        <Box className="h-24" />
      </ScrollView>
      <Fab
        size="lg"
        placement="bottom right"
        onPress={() => setShowAddSchedule(true)}
      >
        <FabIcon size="xl" as={AddIcon} />
      </Fab>
      <Fade />
      <AddEditScheduleActionsheet
        isOpen={showAddSchedule}
        setIsOpen={setShowAddSchedule}
        onSave={(schedule) => router.push(`/schedules/${schedule.id}`)}
      />
    </ThemedContainer>
  );
}
