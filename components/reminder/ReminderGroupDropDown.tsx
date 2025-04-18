import { TouchableOpacity } from "react-native";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Heading } from "../ui/heading";
import { ChevronDownIcon, ChevronRightIcon, Icon } from "../ui/icon";
import { chunkIntoPairs } from "@/lib/utils";
import ReminderSelectCard from "./ReminderSelectCard";
import { Box } from "../ui/box";
import { Reminder } from "@/lib/types";
import { Text } from "@/components/ui/text";

type Props = {
  title: string;
  reminders: Reminder[];
  onNotificationResponse: () => void;
  onMuted: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  persist?: boolean;
  emptyMessage?: string
};

export default function ReminderGroupDropDown({
  title,
  reminders,
  onMuted,
  onNotificationResponse,
  open,
  setOpen,
  persist,
  emptyMessage
}: Props) {
  return (
    <VStack space="xs">
      {persist ? (
        <Heading size="xl" className="pb-4">{title}</Heading>
      ) : (
        <TouchableOpacity onPress={() => setOpen && setOpen(!open)}>
          <HStack space="sm" className="py-4 px-1 items-center">
            <Heading size="xl">{title}</Heading>
            {<Icon size="lg" as={open ? ChevronDownIcon : ChevronRightIcon} />}
          </HStack>
        </TouchableOpacity>
      )}

      {(open || persist) && (
        <VStack space="lg" className="-mt-2">
          {reminders.length === 0 ? (
            <Box className="items-center">
              <Text size="xl">{emptyMessage || 'No Reminders Found'}</Text>
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
      )}
    </VStack>
  );
}
