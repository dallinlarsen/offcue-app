import { ReminderNotification } from "@/lib/types";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "../ui/actionsheet";
import { Heading } from "../ui/heading";
import dayjs from "dayjs";
import { updateNotificationResponse } from "@/lib/db-service";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notification: ReminderNotification | null;
  onUpdate: () => void;
};

export default function ({ isOpen, setIsOpen, notification, onUpdate }: Props) {
  async function updateNotificationHandler(status: 'done' | 'missed' | 'skip') {
    if (!notification) return;
    await updateNotificationResponse(notification.id, status);
    onUpdate();
    setIsOpen(false);
  }

  return (
    <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="items-start">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Heading size="xl" className="mb-2">
          Update {dayjs(notification?.scheduled_at).format("YYYY-MM-DD h:mm a")}
        </Heading>
        <ActionsheetItem onPress={() => updateNotificationHandler("done")}>
          <ActionsheetItemText size="xl">Done</ActionsheetItemText>
        </ActionsheetItem>
        <ActionsheetItem onPress={() => updateNotificationHandler("missed")}>
          <ActionsheetItemText size="xl">Missed</ActionsheetItemText>
        </ActionsheetItem>
        <ActionsheetItem onPress={() => updateNotificationHandler("skip")}>
          <ActionsheetItemText size="xl">Skip</ActionsheetItemText>
        </ActionsheetItem>
      </ActionsheetContent>
    </Actionsheet>
  );
}
