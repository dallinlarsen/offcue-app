import { useEffect, useState } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from "../ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { AddIcon, Icon, TrashIcon } from "../ui/icon";
import { AddScheduleActionsheet } from "./AddScheduleActionsheet";
import useWatch from "@/hooks/useWatch";
import { formatScheduleString } from "@/lib/utils/format";
import { Card } from "../ui/card";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { TouchableOpacity } from "react-native";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "../ui/alert-dialog";
import { Schedule } from "@/lib/schedules/schedules.types";
import { ReminderBase } from "@/lib/reminders/reminders.types";
import { deleteSchedule, getAllSchedules } from "@/lib/schedules/schedules.service";
import { getRemindersByScheduleId } from "@/lib/reminders/reminders.source";

type ScheduleActionsheetProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addSchedule: (schedule: Schedule) => void;
  filterIds: number[];
};

export function ScheduleActionsheet({
  isOpen,
  setIsOpen,
  addSchedule,
  filterIds,
}: ScheduleActionsheetProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(
    null
  );
  const [deleteScheduleReminders, setDeleteScheduleReminders] = useState<
    ReminderBase[]
  >([]);

  const handleNewSchedulePressed = () => {
    setAddOpen(true);
    setIsOpen(false);
  };

  const loadSchedules = async () => {
    try {
      const data = await getAllSchedules();
      setSchedules(data.filter((s) => !filterIds.includes(s.id)));
      console.log(data);
    } catch (error) {
      console.error("Error loading schedules:", error);
    }
  };

  // Load schedules when the component mounts or when the actionsheet is opened
  useEffect(() => {
    loadSchedules();
  }, [isOpen]);

  useWatch(addOpen, (newVal, oldVal) => {
    if (!newVal && oldVal) {
      setIsOpen(true);
    }
  });

  const schedulePressedHandler = (schedule: Schedule) => {
    addSchedule(schedule);
    setIsOpen(false);
  };

  const handleDeleteSchedulePressed = async () => {
    if (scheduleToDelete) await deleteSchedule(scheduleToDelete.id);
    setScheduleToDelete(null);
    loadSchedules();
  };

  const handleScheduleTrashIconPressed = async (schedule: Schedule) => {
    const scheduleReminders = await getRemindersByScheduleId(schedule.id);
    setDeleteScheduleReminders(scheduleReminders);

    setScheduleToDelete(schedule);
  };

  return (
    <>
      <Actionsheet
        snapPoints={[50]}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="items-start">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Heading size="xl" className="mb-2">
            Schedules
          </Heading>
          {/* List of existing schedules */}
          <ActionsheetScrollView>
            <VStack space="sm">
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <Card key={schedule.id} variant="filled">
                    <HStack className="justify-between items-center flex-wrap">
                      <TouchableOpacity
                        onPress={() => schedulePressedHandler(schedule)}
                        className="py-4 pl-4 -my-4 mr-4 -ml-4 flex-1"
                      >
                        <HStack className="items-end flex-wrap -ml-2">
                          <Text
                            numberOfLines={1}
                            size="xl"
                            className="font-semibold ml-2"
                          >
                            {schedule.label || "No Label"}
                          </Text>
                          <Text className="ml-2">
                            {formatScheduleString(schedule)}
                          </Text>
                        </HStack>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="p-5 -m-5 pr-6"
                        onPress={() => handleScheduleTrashIconPressed(schedule)}
                      >
                        <Icon size="lg" as={TrashIcon} className="fill-typography-950"></Icon>
                      </TouchableOpacity>
                    </HStack>
                  </Card>
                ))
              ) : (
                <Text>No schedules found.</Text>
              )}
            </VStack>
          </ActionsheetScrollView>
          <Button
            className="w-full mt-2"
            size="xl"
            onPress={handleNewSchedulePressed}
          >
            <ButtonIcon as={AddIcon} />
            <ButtonText>New Schedule</ButtonText>
          </Button>
        </ActionsheetContent>
      </Actionsheet>
      <AddScheduleActionsheet isOpen={addOpen} setIsOpen={setAddOpen} />
      <AlertDialog
        isOpen={!!scheduleToDelete}
        onClose={() => setScheduleToDelete(null)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="xl" className="font-quicksand-semibold">
              {deleteScheduleReminders.length === 0
                ? "Delete Schedule"
                : "Cannot Delete Schedule"}
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            {deleteScheduleReminders.length === 0 ? (
              <Text size="lg" className="leading-6">
                Are you sure you want to delete{" "}
                {scheduleToDelete?.label
                  ? `the "${scheduleToDelete.label}"`
                  : "this"}{" "}
                schedule? This action cannot be undone.
              </Text>
            ) : (
              <>
                <Text size="lg" className="leading-6">
                  {scheduleToDelete?.label
                    ? `The "${scheduleToDelete.label}"`
                    : "This"}{" "}
                  schedule cannot be deleted because it is being used by the following
                  reminders:
                </Text>
                {deleteScheduleReminders.map((r) => (
                  <HStack key={r.id} space="md" className="my-2">
                    <Text size="lg">•</Text>
                    <Text numberOfLines={1} size="lg" className="leading-6 flex-1">
                      {r.title}
                    </Text>
                  </HStack>
                ))}
              </>
            )}
          </AlertDialogBody>
          <AlertDialogFooter className="mt-4">
            <HStack space="sm">
              <Button
                variant="outline"
                className="flex-1"
                size="xl"
                onPress={() => setScheduleToDelete(null)}
              >
                <ButtonText>
                  {deleteScheduleReminders.length === 0 ? "Cancel" : "Close"}
                </ButtonText>
              </Button>
              {deleteScheduleReminders.length === 0 ? (
                <Button
                  action="primary"
                  className="flex-1"
                  size="xl"
                  onPress={handleDeleteSchedulePressed}
                >
                  <ButtonText>Delete</ButtonText>
                </Button>
              ) : null}
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
