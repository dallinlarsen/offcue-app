import {
  InsertReminder,
  InsertReminderModel,
} from "@/lib/reminders/reminders.types";
import { Card } from "../ui/card";
import { VStack } from "../ui/vstack";
import { Heading } from "../ui/heading";
import {
  formatFrequencyString,
  formatScheduleString,
} from "@/lib/utils/format";
import { Text } from "../ui/text";

type Props = {
  reminder: Partial<InsertReminderModel>;
};

export default function ReminderSummaryBox({ reminder }: Props) {
  return (
    <Card variant="filled">
      <VStack space="sm">
        <Heading size="lg" numberOfLines={1}>
          {reminder.title}
        </Heading>
        <VStack>
          {reminder.description && (
            <Text size="lg" numberOfLines={2}>
              {reminder.description}
            </Text>
          )}
          {reminder.interval_type &&
            reminder.interval_num &&
            reminder.times && (
              <Text size="lg">
                {formatFrequencyString(
                  reminder.times,
                  reminder.interval_num,
                  reminder.interval_type
                )}
              </Text>
            )}
          {reminder.schedules && reminder.schedules.length > 0 && (
            <Text size="lg">
              {reminder.schedules[0].label} (
              {formatScheduleString(reminder.schedules[0])})
            </Text>
          )}
        </VStack>
      </VStack>
    </Card>
  );
}
