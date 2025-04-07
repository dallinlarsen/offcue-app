import React, { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Pressable } from "@/components/ui/pressable";
import {
  Icon,
  ArrowLeftIcon,
  ChevronDownIcon,
  AddIcon,
  CloseIcon,
} from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import colors from "tailwindcss/colors";
import { createReminder } from "@/lib/db-service";
import * as SQLite from "expo-sqlite";
import { FREQUENCY_TYPES } from "@/constants/utils";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Actionsheet } from "@/components/ui/actionsheet";
import { ScheduleActionsheet } from "@/components/reminder/ScheduleActionsheet";
import { Card } from "@/components/ui/card";
import { formatScheduleString } from "@/lib/utils";

export default function NewReminder() {
  const navigation = useNavigation();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [intervalType, setIntervalType] = useState("");
  const [intervalNum, setIntervalNum] = useState<string | undefined>(undefined);
  const [times, setTimes] = useState("");
  const [schedules, setSchedules] = useState<object[]>([]);
  const [trackStreak, setTrackStreak] = useState(false);

  // Schedule Actionsheet
  const [schedulesOpen, setSchedulesOpen] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    // Check if SQLite is available; if not, log a warning.
    if (typeof SQLite.openDatabaseSync !== "function") {
      console.warn(
        "expo-sqlite is not available. Ensure you're running on a native device or a custom dev client."
      );
    }
  }, [navigation]);

  const handleSave = async () => {
    if (!title || !intervalNum || !times) {
      alert("Please fill in all required fields: Title, Frequency, and Times.");
      return;
    }
    const freqNum = parseInt(intervalNum, 10);
    const timesNum = parseInt(times, 10);

    try {
      await createReminder(
        title,
        description,
        intervalType,
        parseInt(intervalNum),
        parseInt(times),
        schedules.map(s => s.id),
        trackStreak,
        false,
        false
      );
      router.back();
    } catch (error) {
      console.error("Error saving reminder:", error);
      alert("Error saving reminder. Please try again.");
    }
  };

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2 mb-4">
        <Pressable className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </Pressable>
        <Heading size="3xl">New Reminder</Heading>
      </Box>
      <ScrollView>
        <VStack space="xl">
          <VStack space="sm">
            <Input size="xl">
              <InputField
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />
            </Input>
            <Textarea size="xl">
              <TextareaInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
              />
            </Textarea>
          </VStack>
          <VStack>
            <Heading size="xl">Every</Heading>
            <Box className="flex flex-row gap-2">
              <Input size="xl" className="flex-1">
                <InputField
                  placeholder="Frequency"
                  value={intervalNum}
                  onChangeText={setIntervalNum}
                  keyboardType="number-pad"
                />
              </Input>
              <Select
                className="flex-1"
                selectedValue={intervalType}
                onValueChange={(value) => setIntervalType(value)}
              >
                <SelectTrigger
                  variant="outline"
                  size="xl"
                  className="flex justify-between"
                >
                  <SelectInput placeholder="Select Option" />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {FREQUENCY_TYPES.map((t) => (
                      <SelectItem
                        key={t.value}
                        label={t.label}
                        value={t.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </Box>
          </VStack>
          <Box>
            <Heading size="xl">Remind Me</Heading>
            <Box className="flex flex-row w-full gap-2 items-center">
              <Input size="xl" className="flex-1">
                <InputField
                  placeholder="Times"
                  value={times}
                  onChangeText={setTimes}
                  keyboardType="number-pad"
                />
              </Input>
              <Text size="xl" className="flex-1">
                Time(s)
              </Text>
            </Box>
          </Box>
          <VStack>
            <Heading size="xl">But Only On</Heading>
            {schedules.length > 0 ? (
              <>
                <VStack space="sm">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id} variant="filled">
                      <HStack className="justify-between items-center">
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
                        <Pressable
                          onPress={() =>
                            setSchedules(
                              schedules.filter((s) => s.id !== schedule.id)
                            )
                          }
                          className="p-3 -m-3"
                        >
                          <Icon as={CloseIcon} size="lg" />
                        </Pressable>
                      </HStack>
                    </Card>
                  ))}
                </VStack>
                <HStack className="justify-between">
                  <Box></Box>
                  <Button
                    variant="link"
                    size="xl"
                    onPress={() => setSchedulesOpen(true)}
                  >
                    <ButtonIcon as={AddIcon} />
                    <ButtonText>Schedule</ButtonText>
                  </Button>
                </HStack>
              </>
            ) : (
              <Button
                size="xl"
                variant="outline"
                onPress={() => setSchedulesOpen(true)}
              >
                <ButtonIcon as={AddIcon} />
                <ButtonText>Schedule</ButtonText>
              </Button>
            )}
          </VStack>
          <HStack space="xl" className="items-center">
            <Text size="xl" className="font-quicksand-semibold">
              Track Streak
            </Text>
            <Switch
              value={trackStreak}
              onValueChange={setTrackStreak}
              trackColor={{ false: colors.gray[300], true: colors.gray[500] }}
              thumbColor={colors.gray[50]}
              ios_backgroundColor={colors.gray[300]}
            />
          </HStack>
        </VStack>
      </ScrollView>
      <Button size="xl" onPress={handleSave}>
        <ButtonText>Save Reminder</ButtonText>
      </Button>
      <ScheduleActionsheet
        isOpen={schedulesOpen}
        setIsOpen={setSchedulesOpen}
        addSchedule={(schedule) => setSchedules([...schedules, schedule])}
        filterIds={schedules.map((s) => s.id)}
      />
    </ThemedContainer>
  );
}
