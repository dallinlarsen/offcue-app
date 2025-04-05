import { useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
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

export default function NewReminder() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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
          <InputField placeholder="Title" />
        </Input>
        <Textarea size="xl">
          <TextareaInput placeholder="Description" />
        </Textarea>
      </Box>
      <Box>
        <Heading size="xl">Every</Heading>
        <Box className="flex flex-row w-full">
          <Input size="xl" className="w-1/2">
            <InputField />
          </Input>
          <Select className="w-1/2">
            <SelectTrigger
              variant="outline"
              size="xl"
              className="flex justify-between w-full"
            >
              <SelectInput placeholder="Select option" />
              <SelectIcon className="mr-3" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem label="Minute(s)" value="ux" />
                <SelectItem label="Hour(s)" value="web" />
                <SelectItem
                  label="Day(s)"
                  value="Cross Platform Development Process"
                />
                {/* <SelectItem label="Week(s)" value="ui" isDisabled={true} />
                <SelectItem label="Month(s)" value="backend" /> */}
              </SelectContent>
            </SelectPortal>
          </Select>
        </Box>
      </Box>
      <Box>
        <Heading size="xl">Remind Me</Heading>
        <Box className="flex flex-row w-full gap-2 items-center">
          <Input size="xl" className="w-1/2">
            <InputField />
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
        <Text size="xl" className="font-quicksand-semibold">Track Streak</Text>
        <Switch
          trackColor={{ false: colors.gray[300], true: colors.gray[500] }}
          thumbColor={colors.gray[50]}
          activeThumbColor={colors.gray[50]}
          ios_backgroundColor={colors.gray[300]}
        />
      </Box>
    </ThemedContainer>
  );
}
