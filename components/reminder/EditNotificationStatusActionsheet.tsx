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
import {
  NotificationResponseStatus,
  RNotification,
} from "@/lib/notifications/notifications.types";
import { updateNotificationResponse } from "@/lib/notifications/notifications.service";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notification: RNotification | null;
  onUpdate: () => void;
};

export default function ({ isOpen, setIsOpen, notification, onUpdate }: Props) {
  async function updateNotificationHandler(status: NotificationResponseStatus) {
    if (!notification) return;
    await updateNotificationResponse(notification.id, status);
    onUpdate();
    setIsOpen(false);
  }

  return (
    <>
      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="items-start">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Heading size="xl" className="mb-2">
            Update{" "}
            {dayjs(notification?.scheduled_at).format("MMM D, YYYY h:mm a")}
          </Heading>
          <ActionsheetItem onPress={() => updateNotificationHandler("done")}>
            <ActionsheetItemText size="xl">Done</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={() => updateNotificationHandler("skip")}>
            <ActionsheetItemText size="xl">Skip</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
