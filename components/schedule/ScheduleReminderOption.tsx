import { TouchableOpacity } from "react-native";
import { Text } from "../ui/text";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Box } from "../ui/box";
import { VStack } from "../ui/vstack";
import { ChevronRightIcon, Icon, PushPinIcon, RepeatIcon } from "../ui/icon";
import dayjs from "dayjs";
import { formatFrequencyString } from "@/lib/utils/format";
import { useRouter } from "expo-router";
import { ReminderBase } from "@/lib/reminders/reminders.types";

type Props = {
  reminder: ReminderBase;
};

export default function ({ reminder }: Props) {
  const router = useRouter();

  function formatDate(dateString: string) {
    return `${dayjs(dateString).format("MMM D, YYYY")} at ${dayjs(
      dateString
    ).format("h:mm a")}`;
  }

  function formatSubText() {
    if (reminder.is_archived) {
      return "Archived on " + formatDate(reminder.updated_at);
    } else if (reminder.is_completed) {
      return "Completed on " + formatDate(reminder.completed_at);
    } else if (reminder.is_muted) {
      return "Muted on " + formatDate(reminder.updated_at);
    } else if (reminder.is_recurring) {
      return formatFrequencyString(
        reminder.times,
        reminder.interval_num,
        reminder.interval_type
      );
    } else {
      return "Created on " + formatDate(reminder.created_at);
    }
  }

  return (
    <TouchableOpacity
      key={reminder.id}
      onPress={() => router.push(`/reminder/${reminder.id}`)}
      className="mb-2"
    >
      <Card variant="filled">
        <HStack className="justify-between items-center flex-wrap">
          <Box className="py-4 pl-4 -my-4 mr-4 -ml-4 flex-1">
            <VStack>
              <Text numberOfLines={1} size="xl" className="font-semibold ml-2">
                {reminder.title}
              </Text>
              <HStack space="md" className="items-center ml-2">
                {reminder.is_recurring ? (
                  <Icon size="xs" as={RepeatIcon} />
                ) : (
                  <Icon
                    size="xs"
                    as={PushPinIcon}
                    className="fill-typography-950"
                  />
                )}
                <Text>{formatSubText()}</Text>
              </HStack>
            </VStack>
          </Box>
          <Box className="p-5 -m-5 pr-6">
            <Icon size="lg" as={ChevronRightIcon}></Icon>
          </Box>
        </HStack>
      </Card>
    </TouchableOpacity>
  );
}
