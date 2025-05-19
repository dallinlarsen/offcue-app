import {
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
        <VStack>
          <Text>
            {reminder.interval_type &&
              reminder.interval_num &&
              reminder.times && (
                <Text size="xl">
                  <Text className="font-bold" size="xl">
                    Randomly
                  </Text>{" "}
                  remind me{" "}
                  <Text size="xl" className="font-bold">
                    {formatFrequencyString(
                      reminder.times,
                      reminder.interval_num,
                      reminder.interval_type
                    )}
                  </Text>
                </Text>
              )}
            {reminder.schedules && reminder.schedules.length > 0 && (
              <Text size="xl">
                {" "}
                but only when{" "}
                <Text className="font-bold" size="xl">
                  {reminder.schedules[0].label}
                </Text>{" "}
                ({formatScheduleString(reminder.schedules[0])})
              </Text>
            )}
            <Text size="xl">
              {reminder.interval_type || reminder.schedules ? " to" : ""}{" "}
              <Text size="xl" className="font-bold">{reminder.title}</Text>
            </Text>
          </Text>
          {reminder.description && (
            <>
              <Heading size="sm" className="mt-2">
                Description
              </Heading>
              <Text size="lg" numberOfLines={2}>
                {reminder.description}
              </Text>
            </>
          )}
        </VStack>
      </VStack>
    </Card>
  );
}
