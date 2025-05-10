import Fade from "@/components/Fade";
import AddEditScheduleActionsheet from "@/components/schedule/AddEditScheduleActionsheet";
import InactivateScheduleDialog from "@/components/schedule/InactivateScheduleDialog";
import DeleteScheduleDialog from "@/components/schedule/DeleteScheduleDialog";
import ScheduleReminderGroupDropDown from "@/components/schedule/ScheduleReminderGroupDropDown";
import ScheduleReminderOption from "@/components/schedule/ScheduleReminderOption";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
  PencilIcon,
  TrashIcon,
} from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getRemindersByScheduleId } from "@/lib/reminders/reminders.source";
import { ReminderBase } from "@/lib/reminders/reminders.types";
import {
  deleteSchedule,
  getSchedule,
  updateSchedule,
} from "@/lib/schedules/schedules.service";
import { Schedule } from "@/lib/schedules/schedules.types";
import { formatScheduleString } from "@/lib/utils/format";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, SectionList, TouchableOpacity } from "react-native";
import ScrollingHeader from "@/components/ScrollingHeader";

export default function () {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [reminders, setReminders] = useState<ReminderBase[]>([]);
  const [currentReminders, setCurrentReminders] = useState<ReminderBase[]>([]);
  const [mutedReminders, setMutedReminders] = useState<ReminderBase[]>([]);
  const [completedReminders, setCompletedReminders] = useState<ReminderBase[]>(
    []
  );
  const [archivedReminders, setArchivedReminders] = useState<ReminderBase[]>(
    []
  );
  const [editOpen, setEditOpen] = useState(false);
  const [inactivateOpen, setInactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reminderGroupsToShow, setReminderGroupsToShow] = useState<string[]>(
    []
  );

  async function fetchData() {
    setSchedule(await getSchedule(parseInt(id as string)));
    setReminders(await getRemindersByScheduleId(parseInt(id as string)));
  }

  useEffect(() => {
    setCurrentReminders(
      reminders.filter((r) => !r.is_archived && !r.is_completed && !r.is_muted)
    );
    setMutedReminders(reminders.filter((r) => r.is_muted && !r.is_archived));
    setCompletedReminders(reminders.filter((r) => r.is_completed));
    setArchivedReminders(reminders.filter((r) => r.is_archived));
  }, [reminders]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  async function inactivateScheduleHandler() {
    setInactivateOpen(false);
    await updateSchedule(schedule?.id!, { is_active: false }, false);
    fetchData();
  }

  async function restoreScheduleHandler() {
    await updateSchedule(schedule?.id!, { is_active: true }, false);
    fetchData();
  }

  async function deleteScheduleHandler() {
    await deleteSchedule(schedule?.id!);
    router.back();
  }

  function toggleReminderGroup(value: string) {
    if (reminderGroupsToShow.includes(value)) {
      setReminderGroupsToShow(reminderGroupsToShow.filter((r) => r !== value));
    } else {
      setReminderGroupsToShow([...reminderGroupsToShow, value]);
    }
  }

  function getReminderListSize(key: string) {
    switch (key) {
      case "muted": {
        return mutedReminders.length;
      }
      case "completed": {
        return completedReminders.length;
      }
      case "archived": {
        return archivedReminders.length;
      }
      default: {
        return 0;
      }
    }
  }

  return schedule ? (
    <ThemedContainer>
      <ScrollingHeader text={schedule.label} goBack={() => router.back()} />
      <VStack space="md">
        <HStack className="items-start">
          <Heading size="xl">{formatScheduleString(schedule)}</Heading>
        </HStack>
        {!schedule.is_active ? (
          <>
            <Alert className="bg-orange-100 dark:bg-orange-950">
              <AlertIcon
                as={EyeOffIcon}
                className="text-orange-800 dark:text-orange-100"
              />
              <AlertText
                size="lg"
                className="text-orange-800 dark:text-orange-100"
              >
                Inactivated on{" "}
                {dayjs(schedule.updated_at + "+00:00").format("MMM D, YYYY")} at{" "}
                {dayjs(schedule.updated_at + "+00:00").format("h:mm a")}
              </AlertText>
            </Alert>
            <HStack space="md">
              <Button
                className="flex-1"
                variant="outline"
                size="xl"
                onPress={restoreScheduleHandler}
              >
                <ButtonIcon as={EyeIcon} />
                <ButtonText>Activate</ButtonText>
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                size="xl"
                onPress={() => setDeleteOpen(true)}
              >
                <ButtonIcon as={TrashIcon} className="fill-typography-950" />
                <ButtonText>Delete</ButtonText>
              </Button>
            </HStack>
          </>
        ) : (
          <Button
            variant="outline"
            size="xl"
            onPress={() => setInactivateOpen(true)}
          >
            <ButtonIcon as={EyeOffIcon} />
            <ButtonText>Inactivate</ButtonText>
          </Button>
        )}
        <Heading size="xl" className="mt-3">
          Reminders
        </Heading>
      </VStack>
      {reminders.length > 0 ? (
        <SectionList
          showsVerticalScrollIndicator={false}
          sections={[
            {
              title: "Current",
              data: currentReminders,
            },
            {
              title: "Muted",
              data: reminderGroupsToShow.includes("muted")
                ? mutedReminders
                : [],
            },
            {
              title: "Completed",
              data: reminderGroupsToShow.includes("completed")
                ? completedReminders
                : [],
            },
            {
              title: "Archived",
              data: reminderGroupsToShow.includes("archived")
                ? archivedReminders
                : [],
            },
            {
              title: "",
              data: [null, null],
            },
          ]}
          renderItem={({ item }) =>
            item ? (
              <ScheduleReminderOption reminder={item} />
            ) : (
              <Box className="h-12" />
            )
          }
          renderSectionHeader={({ section: { title, data } }) =>
            title === "Current" ? (
              <Box className="-mb-4">
                <Box className="bg-background-light dark:bg-background-dark mb-3">
                  <Heading size="lg">{title}</Heading>
                  {currentReminders.length === 0 && (
                    <Text className="mb-8">
                      No current reminders are using this schedule.
                    </Text>
                  )}
                </Box>
                <Box>
                  <Fade
                    heightClassDark="dark:h-4"
                    heightClassLight="h-4"
                    reverse
                  />
                </Box>
              </Box>
            ) : title.trim() !== "" &&
              getReminderListSize(title.toLowerCase()) !== 0 ? (
              <TouchableOpacity
                onPress={() => toggleReminderGroup(title.toLowerCase())}
                className={
                  reminderGroupsToShow.includes(title.toLowerCase())
                    ? `-mb-4`
                    : "mb-4"
                }
              >
                <HStack
                  space="sm"
                  className="items-center mb-3 bg-background-light dark:bg-background-dark"
                >
                  <Heading size="lg">{title}</Heading>
                  <Icon
                    size="md"
                    as={
                      reminderGroupsToShow.includes(title.toLowerCase())
                        ? ChevronDownIcon
                        : ChevronRightIcon
                    }
                  />
                </HStack>
                <Box>
                  <Fade
                    heightClassDark="dark:h-4"
                    heightClassLight="h-4"
                    reverse
                  />
                </Box>
              </TouchableOpacity>
            ) : null
          }
          SectionSeparatorComponent={() => <Box className="h-4" />}
        />
      ) : (
        <Text>No reminders are using this schedule.</Text>
      )}
      <Fade />
      <AddEditScheduleActionsheet
        schedule={schedule}
        isOpen={editOpen}
        setIsOpen={setEditOpen}
        onSave={(schedule) => setSchedule(schedule)}
      />
      <InactivateScheduleDialog
        isOpen={inactivateOpen}
        schedule={schedule}
        onCancel={() => setInactivateOpen(false)}
        onInactivate={inactivateScheduleHandler}
      />
      <DeleteScheduleDialog
        isOpen={deleteOpen}
        schedule={schedule}
        block={reminders.length > 0}
        onCancel={() => setDeleteOpen(false)}
        onDelete={deleteScheduleHandler}
      />
      {schedule.is_active && (
        <Fab size="lg" onPress={() => setEditOpen(true)}>
          <FabIcon as={PencilIcon} size="xl" className="fill-typography-50" />
        </Fab>
      )}
    </ThemedContainer>
  ) : (
    <ThemedContainer />
  );
}
