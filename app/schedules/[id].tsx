import Fade from "@/components/Fade";
import AddEditScheduleActionsheet from "@/components/schedule/AddEditScheduleActionsheet";
import ArchiveScheduleDialog from "@/components/schedule/ArchiveScheduleDialog";
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
  ArchiveArrowUp,
  ArchiveOutlineIcon,
  ArrowLeftIcon,
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
import {
  formatScheduleString,
} from "@/lib/utils/format";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

export default function () {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [reminders, setReminders] = useState<ReminderBase[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reminderGroupsToShow, setReminderGroupsToShow] = useState<string[]>(
    []
  );

  async function fetchData() {
    setSchedule(await getSchedule(parseInt(id as string)));
    setReminders(await getRemindersByScheduleId(parseInt(id as string)));
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  async function archiveScheduleHandler() {
    setArchiveOpen(false);
    await updateSchedule(schedule?.id!, { is_archived: true });
    fetchData();
  }

  async function restoreScheduleHandler() {
    await updateSchedule(schedule?.id!, { is_archived: false });
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

  return schedule ? (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2">
        <TouchableOpacity className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading
          numberOfLines={1}
          ellipsizeMode="tail"
          size="3xl"
          className="flex-1"
        >
          {schedule.label}
        </Heading>
      </Box>
      <VStack space="md">
        <HStack className="justify-between items-start">
          <Heading size="xl">{formatScheduleString(schedule)}</Heading>
        </HStack>
        {schedule.is_archived ? (
          <>
            <Alert className="bg-orange-100 dark:bg-orange-950">
              <AlertIcon
                as={ArchiveOutlineIcon}
                className="fill-orange-800 dark:fill-orange-100"
              />
              <AlertText
                size="lg"
                className="text-orange-800 dark:text-orange-100"
              >
                Archived on{" "}
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
                <ButtonIcon
                  as={ArchiveArrowUp}
                  className="fill-typography-950"
                />
                <ButtonText>Restore</ButtonText>
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
            onPress={() => setArchiveOpen(true)}
          >
            <ButtonIcon
              as={ArchiveOutlineIcon}
              className="fill-typography-950"
            />
            <ButtonText>Archive</ButtonText>
          </Button>
        )}
        <Heading size="xl" className="mt-3">
          Reminders
        </Heading>
      </VStack>
      {reminders.length > 0 ? (
        <ScrollView>
          <VStack space="xl">
            <Box>
              <Heading size="lg">Current</Heading>
              <VStack space="md">
                {reminders
                  .filter(
                    (r) => !r.is_archived && !r.is_completed && !r.is_muted
                  )
                  .map((reminder) => (
                    <ScheduleReminderOption
                      key={reminder.id}
                      reminder={reminder}
                    />
                  ))}
              </VStack>
            </Box>
            <ScheduleReminderGroupDropDown
              reminders={reminders.filter((r) => r.is_muted && !r.is_archived)}
              label="Muted"
              showDropDown={reminderGroupsToShow.includes("muted")}
              onPress={() => toggleReminderGroup("muted")}
            />
            <ScheduleReminderGroupDropDown
              reminders={reminders.filter((r) => r.is_completed)}
              label="Completed"
              showDropDown={reminderGroupsToShow.includes("completed")}
              onPress={() => toggleReminderGroup("completed")}
            />
            <ScheduleReminderGroupDropDown
              reminders={reminders.filter((r) => r.is_archived)}
              label="Archived"
              showDropDown={reminderGroupsToShow.includes("archived")}
              onPress={() => toggleReminderGroup("archived")}
            />
            <Box className="h-24" />
          </VStack>
        </ScrollView>
      ) : (
        <Text>No Reminders are using this schedule.</Text>
      )}
      <Fade />
      <AddEditScheduleActionsheet
        schedule={schedule}
        isOpen={editOpen}
        setIsOpen={setEditOpen}
        onSave={(schedule) => setSchedule(schedule)}
      />
      <ArchiveScheduleDialog
        isOpen={archiveOpen}
        schedule={schedule}
        onCancel={() => setArchiveOpen(false)}
        onArchive={archiveScheduleHandler}
      />
      <DeleteScheduleDialog
        isOpen={deleteOpen}
        schedule={schedule}
        block={reminders.length > 0}
        onCancel={() => setDeleteOpen(false)}
        onDelete={deleteScheduleHandler}
      />
      {!schedule.is_archived && (
        <Fab size="lg" onPress={() => setEditOpen(true)}>
          <FabIcon as={PencilIcon} size="xl" className="fill-typography-50" />
        </Fab>
      )}
    </ThemedContainer>
  ) : (
    <ThemedContainer />
  );
}
