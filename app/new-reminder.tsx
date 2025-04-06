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
import { saveReminder, initDatabase } from "@/lib/database";
import * as SQLite from "expo-sqlite";
import { FREQUENCY_TYPES } from "@/constants/utils";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";

export default function NewReminder() {
  const navigation = useNavigation();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [frequencyType, setFrequencyType] = useState<string | null>(null);
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
    if (!title || !frequency || !times || !frequencyType) {
      alert("Please fill in all required fields: Title, Frequency, Frequency Type and Times.");
      return;
    }
    const freqNum = parseInt(frequency, 10);
    const timesNum = parseInt(times, 10);

    try {
      await saveReminder(
        title,
        description,
        freqNum,
        frequencyType || 'minute',
        timesNum,
        trackStreak,
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
                  value={frequency}
                  onChangeText={setFrequency}
                  keyboardType="number-pad"
                />
              </Input>
              <Select
                className="flex-1"
                selectedValue={frequencyType}
                onValueChange={(value) => setFrequencyType(value)}
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
                      <SelectItem key={t.value} label={t.label} value={t.value} />
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
            <Button size="xl" variant="outline">
              <ButtonIcon as={AddIcon} />
              <ButtonText>Schedule</ButtonText>
            </Button>
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
    </ThemedContainer>
  );
}
