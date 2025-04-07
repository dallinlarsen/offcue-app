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
import { getAllSchedules } from "@/lib/db-service";
import { formatScheduleString } from "@/lib/utils";
import { Card } from "../ui/card";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";

type ScheduleActionsheetProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ScheduleActionsheet({
  isOpen,
  setIsOpen,
}: ScheduleActionsheetProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);

  const handleNewSchedulePressed = () => {
    setAddOpen(true);
    setIsOpen(false);
  };

  // Load schedules when the component mounts or when the actionsheet is opened
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const data = await getAllSchedules();
        setSchedules(data);
        console.log(data);
      } catch (error) {
        console.error("Error loading schedules:", error);
      }
    };
    loadSchedules();
  }, [isOpen]);

  useWatch(addOpen, (newVal, oldVal) => {
    if (!newVal && oldVal) {
      setIsOpen(true);
    }
  });

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
                    <HStack className="justify-between">
                      <HStack space="md" className="items-end">
                        <Text size="xl" className="font-semibold">
                          {schedule.label || "No Label"}
                        </Text>
                        <Text>
                          {formatScheduleString(
                            schedule.start_time,
                            schedule.end_time,
                            [
                              schedule.is_sunday && "sunday",
                              schedule.is_monday && "monday",
                              schedule.is_tuesday && "tuesday",
                              schedule.is_wednesday && "wednesday",
                              schedule.is_thursday && "thursday",
                              schedule.is_friday && "friday",
                              schedule.is_saturday && "saturday",
                            ].filter((d) => !!d)
                          )}
                        </Text>
                      </HStack>
                      <Icon as={TrashIcon}></Icon>
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
    </>
  );
}