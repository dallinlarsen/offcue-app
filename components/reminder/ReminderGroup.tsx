import { Heading } from "../ui/heading";
import { chunkIntoPairs } from "@/lib/utils/format";
import ReminderSelectCard from "./ReminderSelectCard";
import { Box } from "../ui/box";
import { Text } from "@/components/ui/text";
import { Reminder } from "@/lib/reminders/reminders.types";
import { SectionList } from "react-native";
import { useRef } from "react";
import Fade from "../Fade";

type Props = {
  reminders: { title: string; reminders: Reminder[], emptyMessage?: string }[];
  onNotificationResponse: () => void;
  onMuted: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export default function ReminderGroup({
  reminders,
  onMuted,
  onNotificationResponse,
}: Props) {
  const chunkedReminders = useRef(
    reminders.map((r) => ({ ...r, data: chunkIntoPairs(r.reminders) }))
  );

  return (
    <SectionList
      sections={chunkedReminders.current}
      renderItem={({ item }) => (
        <Box className="flex flex-row gap-4 mb-4">
          {item.map((r, idx) =>
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
      )}
      renderSectionHeader={({ section: { title, reminders, emptyMessage } }) =>
        reminders.length > 0 ? (
          title !== "" ? (
            <>
              <Heading
                size="lg"
                className="mb-2 bg-background-light dark:bg-background-dark"
              >
                {title}
              </Heading>
              <Box>
                <Fade heightClassDark="dark:h-2" heightClassLight="h-2" reverse />
              </Box>
            </>
          ) : (
            <></>
          )
        ) : (
          <Box>
            <Heading
              size="lg"
              className="mb-1 bg-background-light dark:bg-background-dark"
            >
              {title}
            </Heading>
            <Box className="items-center mb-12">
              <Text size="xl">{emptyMessage || "No Reminders Found"}</Text>
            </Box>
          </Box>
        )
      }
      keyExtractor={(item, index) => JSON.stringify(item) + index}
    />
  );
}
