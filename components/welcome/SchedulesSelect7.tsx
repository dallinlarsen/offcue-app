import { VStack } from "../ui/vstack";
import { ScrollView, TouchableOpacity } from "react-native";
import Fade from "../Fade";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { AddIcon, Icon, CheckboxMarkedIcon, CheckboxBlankOutlineIcon, CheckIcon } from "../ui/icon";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { useState } from "react";
import { EXAMPLE_SCHEDULES } from "@/constants";
import { formatScheduleString } from "@/lib/utils/format";
import { Heading } from "../ui/heading";
import { createSchedule } from "@/lib/schedules/schedules.service";
import { useRouter } from "expo-router";

export default function SchedulesSelect7() {
  const router = useRouter();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  function toggleCheckbox(idx: number) {
    if (selectedIndexes.includes(idx)) {
      setSelectedIndexes(selectedIndexes.filter((i) => i !== idx));
    } else {
      setSelectedIndexes([...selectedIndexes, idx]);
    }
  }

  async function nextPressedHandler() {
    for (const schedule of EXAMPLE_SCHEDULES.filter((_, idx) =>
      selectedIndexes.includes(idx)
    )) {
        await createSchedule(schedule);
    }
    router.dismissTo('/schedules');
  }

  return (
    <VStack className="justify-between flex-1">
      <Heading size="2xl" className="mb-2">
        Preload Schedules
      </Heading>
      <ScrollView showsVerticalScrollIndicator={false}>
        {EXAMPLE_SCHEDULES.map((s, idx) => (
          <Card key={idx} variant="filled" className="mb-2">
            <HStack className="justify-between items-center flex-wrap">
              <TouchableOpacity
                onPress={() => toggleCheckbox(idx)}
                className="py-4 pl-4 -my-4 mr-4 -ml-4 flex-1"
              >
                <HStack className="items-start" space="sm">
                  <Icon
                    className={`mt-1 ${selectedIndexes.includes(idx) ? '' : 'fill-typography-950'}`}
                    as={selectedIndexes.includes(idx) ? CheckIcon : CheckboxBlankOutlineIcon}
                  />
                  <VStack className="flex-wrap -ml-2">
                    <Text
                      numberOfLines={1}
                      size="xl"
                      className="font-semibold ml-2"
                    >
                      {s.label}
                    </Text>
                    <Text className="ml-2">{formatScheduleString(s)}</Text>
                  </VStack>
                </HStack>
              </TouchableOpacity>
            </HStack>
          </Card>
        ))}
        <Box className="h-24" />
      </ScrollView>
      <Fade />
      <Button size="xl" onPress={nextPressedHandler}>
        <ButtonIcon as={AddIcon} />
        <ButtonText>Add Schedules</ButtonText>
      </Button>
    </VStack>
  );
}
