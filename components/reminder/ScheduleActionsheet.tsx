import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "../ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { AddIcon } from "../ui/icon";
import { AddScheduleActionsheet } from "./AddScheduleActionsheet";
import useWatch from "@/hooks/useWatch";
import { getAllSchedules } from "@/lib/db-service";

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
      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="items-start">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Heading size="xl" className="mb-2">
            Schedules
          </Heading>
          <Button
            className="w-full"
            size="xl"
            onPress={handleNewSchedulePressed}
          >
            <ButtonIcon as={AddIcon} />
            <ButtonText>New Schedule</ButtonText>
          </Button>
          {/* List of existing schedules */}
          <View style={{ marginTop: 16, width: "100%" }}>
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <View
                  key={schedule.id}
                  style={{
                    marginVertical: 4,
                    padding: 8,
                    backgroundColor: "#eee",
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    {schedule.label || "No Label"}
                  </Text>
                  <Text>
                    {schedule.startTime} - {schedule.endTime}
                  </Text>
                  <Text>
                    {schedule.isSunday ? "Sun " : ""}
                    {schedule.isMonday ? "Mon " : ""}
                    {schedule.isTuesday ? "Tue " : ""}
                    {schedule.isWednesday ? "Wed " : ""}
                    {schedule.isThursday ? "Thu " : ""}
                    {schedule.isFriday ? "Fri " : ""}
                    {schedule.isSaturday ? "Sat " : ""}
                  </Text>
                </View>
              ))
            ) : (
              <Text>No schedules found.</Text>
            )}
          </View>
        </ActionsheetContent>
      </Actionsheet>
      <AddScheduleActionsheet isOpen={addOpen} setIsOpen={setAddOpen} />
    </>
  );
}