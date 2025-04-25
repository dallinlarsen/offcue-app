import { VStack } from "../ui/vstack";
import { Heading } from "../ui/heading";
import { chunkIntoPairs } from "@/lib/utils/format";
import ReminderSelectCard from "./ReminderSelectCard";
import { Box } from "../ui/box";
import { Text } from "@/components/ui/text";
import { Reminder } from "@/lib/reminders/reminders.types";

type Props = {
  title?: string;
  reminders: Reminder[];
  onNotificationResponse: () => void;
  onMuted: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  emptyMessage?: string;
};

export default function ReminderGroup({
  title,
  reminders,
  onMuted,
  onNotificationResponse,
  emptyMessage,
}: Props) {
  return (
    <VStack space="xs">
      {title && (
        <Heading size="md">
          {title}
        </Heading>
      )}
      <VStack space="lg">
        {reminders.length === 0 ? (
          <Box className="items-center">
            <Text size="xl">{emptyMessage || "No Reminders Found"}</Text>
          </Box>
        ) : (
          chunkIntoPairs(reminders).map((p, idx) => (
            <Box className="flex flex-row gap-4" key={idx}>
              {p.map((r, idx) =>
                r ? (
                  <ReminderSelectCard
                    key={r.id}
                    reminder={r}
                    onNotificationResponse={onNotificationResponse}
                    onMuted={onMuted}
                  />
                ) : (
                  <Box
                    key={`idx_${idx}`}
                    className="p-3 flex-1 aspect-square opacity-0"
                  />
                )
              )}
            </Box>
          ))
        )}
      </VStack>
    </VStack>
  );
}
