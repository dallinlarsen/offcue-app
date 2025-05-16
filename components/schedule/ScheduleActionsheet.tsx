import { useEffect, useState } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
} from "../ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { AddIcon } from "../ui/icon";
import { formatScheduleString } from "@/lib/utils/format";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { TouchableOpacity } from "react-native";
import { Schedule } from "@/lib/schedules/schedules.types";
import { getAllSchedulesAlphabetical } from "@/lib/schedules/schedules.service";
import Fade from "../Fade";
import { Box } from "../ui/box";

type ScheduleActionsheetProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addSchedule: (schedule: Schedule) => void;
  setAddScheduleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filterIds: number[];
};

export function ScheduleActionsheet({
  isOpen,
  setIsOpen,
  addSchedule,
  setAddScheduleOpen,
  filterIds,
}: ScheduleActionsheetProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const loadSchedules = async () => {
    try {
      const data = await getAllSchedulesAlphabetical();
      setSchedules(
        data.filter((s) => s.is_active && !filterIds.includes(s.id))
      );
      console.log(data);
    } catch (error) {
      console.error("Error loading schedules:", error);
    }
  };

  // Load schedules when the component mounts or when the actionsheet is opened
  useEffect(() => {
    loadSchedules();
  }, [isOpen]);

  const schedulePressedHandler = (schedule: Schedule) => {
    addSchedule(schedule);
    setIsOpen(false);
  };

  return (
    <>
      <Actionsheet
        snapPoints={[50]}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="items-start relative">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Heading size="xl" className="mb-2">
            Schedules
          </Heading>
          {/* List of existing schedules */}
          <ActionsheetFlatList
            data={[...schedules, null]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) =>
              item ? (
                <Card variant="filled" className="mb-2">
                  <HStack className="justify-between items-center flex-wrap">
                    <TouchableOpacity
                      onPress={() => schedulePressedHandler(item as Schedule)}
                      className="py-4 pl-4 -my-4 mr-4 -ml-4 flex-1"
                    >
                      <HStack className="items-end flex-wrap -ml-2">
                        <Text
                          numberOfLines={1}
                          size="xl"
                          className="font-semibold ml-2"
                        >
                          {(item as Schedule).label || "No Label"}
                        </Text>
                        <Text className="ml-2">
                          {formatScheduleString(item as Schedule)}
                        </Text>
                      </HStack>
                    </TouchableOpacity>
                  </HStack>
                </Card>
              ) : schedules.length === 0 ? (
                <Text>No schedules found.</Text>
              ) : (
                <Box className="h-12" />
              )
            }
            keyExtractor={(item, idx) => `${idx}_${(item as Schedule)?.id}`}
          />

          <Fade
            className="bottom-24"
            heightClassLight="h-14"
            heightClassDark="dark:h-14"
          />
          <Button
            className="w-full"
            size="xl"
            onPress={() => setAddScheduleOpen(true)}
          >
            <ButtonIcon as={AddIcon} />
            <ButtonText>New Schedule</ButtonText>
          </Button>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
