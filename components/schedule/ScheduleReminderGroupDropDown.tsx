import { TouchableOpacity } from "react-native";
import { Box } from "../ui/box";
import { HStack } from "../ui/hstack";
import { Heading } from "../ui/heading";
import { ChevronDownIcon, ChevronRightIcon, Icon } from "../ui/icon";
import { VStack } from "../ui/vstack";
import ScheduleReminderOption from "./ScheduleReminderOption";
import { ReminderBase } from "@/lib/reminders/reminders.types";

type Props = {
  label: string;
  showDropDown: boolean;
  reminders: ReminderBase[];
  onPress: () => void;
};

export default function ({ label, showDropDown, reminders, onPress }: Props) {
  return reminders.length > 0 ? (
    <Box>
      <TouchableOpacity onPress={onPress}>
        <HStack space="sm" className="items-center py-2">
          <Heading size="lg">{label}</Heading>
          <Icon
            size="md"
            as={showDropDown ? ChevronDownIcon : ChevronRightIcon}
          />
        </HStack>
      </TouchableOpacity>
      {showDropDown && (
        <VStack space="md">
          {reminders.map((reminder) => (
            <ScheduleReminderOption key={reminder.id} reminder={reminder} />
          ))}
        </VStack>
      )}
    </Box>
  ) : null;
}
