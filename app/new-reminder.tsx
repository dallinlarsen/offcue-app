import React, { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Pressable } from "@/components/ui/pressable";
import { Icon, ArrowLeftIcon, ChevronDownIcon, AddIcon } from "@/components/ui/icon";
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
import { saveReminder, initDatabase } from "@/lib/database";
import * as SQLite from "expo-sqlite";

export default function NewReminder() {
  const navigation = useNavigation();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [frequencyType, setFrequencyType] = useState("Minute(s)");
  const [times, setTimes] = useState("");
  const [trackStreak, setTrackStreak] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    initDatabase();

    // Check if SQLite is available; if not, log a warning.
    if (typeof SQLite.openDatabaseSync !== "function") {
      console.warn(
        "expo-sqlite is not available. Ensure you're running on a native device or a custom dev client."
      );
    }
  }, [navigation]);

  const handleSave = async () => {
    if (!title || !frequency || !times) {
      alert("Please fill in all required fields: Title, Frequency, and Times.");
      return;
    }
    const freqNum = parseInt(frequency, 10);
    const timesNum = parseInt(times, 10);

    try {
      await saveReminder(title, description, freqNum, frequencyType, timesNum, trackStreak, false);
      router.back();
    } catch (error) {
      console.error("Error saving reminder:", error);
      alert("Error saving reminder. Please try again.");
    }
  };

  return (
    <ThemedContainer className="flex gap-4">
      <Box className="flex flex-row items-center -mt-2">
        <Pressable className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </Pressable>
        <Heading size="3xl">New Reminder</Heading>
      </Box>
      <Box className="flex gap-2">
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
      </Box>
      <Box>
        <Heading size="xl">Every</Heading>
        <Box className="flex flex-row w-full">
          <Input size="xl" className="w-1/2">
            <InputField
              placeholder="Frequency"
              value={frequency}
              onChangeText={setFrequency}
            />
          </Input>
          <Select
            className="w-1/2"
            selectedValue={frequencyType}
            onValueChange={(value) => setFrequencyType(value)}
          >
            <SelectTrigger variant="outline" size="xl" className="flex justify-between w-full">
              <SelectInput placeholder="Select option" />
              <SelectIcon className="mr-3" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem label="Minute(s)" value="Minute(s)" />
                <SelectItem label="Hour(s)" value="Hour(s)" />
                <SelectItem label="Day(s)" value="Day(s)" />
              </SelectContent>
            </SelectPortal>
          </Select>
        </Box>
      </Box>
      <Box>
        <Heading size="xl">Remind Me</Heading>
        <Box className="flex flex-row w-full gap-2 items-center">
          <Input size="xl" className="w-1/2">
            <InputField
              placeholder="Times"
              value={times}
              onChangeText={setTimes}
            />
          </Input>
          <Text size="xl">Time(s)</Text>
        </Box>
      </Box>
      <Box>
        <Heading size="xl">But Only On</Heading>
        <Button size="xl" variant="outline">
          <ButtonIcon as={AddIcon} />
          <ButtonText>Schedule</ButtonText>
        </Button>
      </Box>
      <Box className="flex flex-row gap-4 items-center mt-2">
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
      </Box>
      <Box className="flex items-center mt-4">
        <Button size="xl" onPress={handleSave}>
          <ButtonText>Save Reminder</ButtonText>
        </Button>
      </Box>
    </ThemedContainer>
  );
}