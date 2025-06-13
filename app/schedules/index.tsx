import Fade from "@/components/Fade";
import AddEditScheduleActionsheet from "@/components/schedule/AddEditScheduleActionsheet";
import ScheduleOption from "@/components/schedule/ScheduleOption";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
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
import { getAllSchedules } from "@/lib/schedules/schedules.service";
import { ScheduleWithCount } from "@/lib/schedules/schedules.types";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { SectionList, TouchableOpacity } from "react-native";

export default function SchedulesScreen() {
  const router = useRouter();

  const [schedules, setSchedules] = useState<ScheduleWithCount[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [reminderSchedules, setReminderSchedules] = useState<
    ScheduleWithCount[]
  >([]);
  const [noReminderSchedules, setNoReminderSchedules] = useState<
    ScheduleWithCount[]
  >([]);
  const [hiddenSchedules, setHiddenSchedules] = useState<ScheduleWithCount[]>(
    []
  );

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

  useEffect(() => {
    setReminderSchedules(
      schedules.filter((s) => s.is_active && s.reminder_count > 0)
    );
    setNoReminderSchedules(
      schedules.filter((s) => s.is_active && s.reminder_count === 0)
    );
    setHiddenSchedules(schedules.filter((s) => !s.is_active));
  }, [schedules]);

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center pb-1 -mb-2">
        <Heading size="2xl">Schedules</Heading>
      </Box>
      <SectionList
        sections={[
          {
            title: "With Reminders",
            data: reminderSchedules,
          },
          {
            title: "Without Reminders",
            data: noReminderSchedules,
          },
          {
            title: "Hidden",
            data: showArchived ? hiddenSchedules : [],
          },
          {
            title: "",
            data: [null, null],
          },
        ]}
        renderItem={({ item }) =>
          item ? <ScheduleOption schedule={item} /> : <Box className="h-12" />
        }
        // @ts-expect-error TODO: Modify return types to match function return definition
        renderSectionHeader={({ section: { title } }) =>
          title === "Hidden" ? (
            hiddenSchedules.length > 0 && (
              <TouchableOpacity onPress={() => setShowArchived(!showArchived)}>
                <HStack
                  className="items-center bg-background-light dark:bg-background-dark pt-2"
                  space="sm"
                >
                  <Heading size="xl">Hidden</Heading>
                  <Icon
                    as={showArchived ? ChevronDownIcon : ChevronRightIcon}
                  />
                </HStack>
              </TouchableOpacity>
            )
          ) : title === "With Reminders" ? (
            <>
              <Heading
                size="xl"
                className="bg-background-light dark:bg-background-dark pt-2"
              >
                {title}
              </Heading>
              {reminderSchedules.length === 0 && (
                <Text className="pb-4 -mt-2">
                  No Schedules With Reminders Assigned
                </Text>
              )}
            </>
          ) : (
            noReminderSchedules.length > 0 && (
              <>
                <Heading
                  size="xl"
                  className="bg-background-light dark:bg-background-dark pt-2"
                >
                  {title}
                </Heading>
                {noReminderSchedules.length === 0 && (
                  <Text className="pb-4 -mt-2">
                    No Schedules With Reminders Assigned
                  </Text>
                )}
              </>
            )
          )
        }
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => JSON.stringify(item) + index}
        SectionSeparatorComponent={() => <Box className="h-3" />}
      />
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
        onSave={() => loadSchedules()}
      />
    </ThemedContainer>
  );
}
