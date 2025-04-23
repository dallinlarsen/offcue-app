import {
  NotificationResponseStatus,
  Reminder,
  ReminderNotification,
} from "@/lib/types";
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
  updateNotificationResponse,
  updateNotificationResponseOneTime,
} from "@/lib/db-service";
import { useState } from "react";
import OneTimeDoneToLaterDialog from "./OneTimeDoneToLaterDialog";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notification: ReminderNotification | null;
  recurring: boolean;
  onUpdate: () => void;
};

export default function ({
  isOpen,
  setIsOpen,
  notification,
  onUpdate,
  recurring,
}: Props) {
  async function updateNotificationHandler(status: NotificationResponseStatus) {
    if (!notification) return;
    await updateNotificationResponse(notification.id, status, recurring);
    onUpdate();
    setDialogOpen(false);
    setIsOpen(false);
  }

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <OneTimeDoneToLaterDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onContinue={() => updateNotificationHandler("later")}
      />
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
          {recurring ? (
            <ActionsheetItem onPress={() => updateNotificationHandler("skip")}>
              <ActionsheetItemText size="xl">Skip</ActionsheetItemText>
            </ActionsheetItem>
          ) : (
            <ActionsheetItem onPress={() => setDialogOpen(true)}>
              <ActionsheetItemText size="xl">Later</ActionsheetItemText>
            </ActionsheetItem>
          )}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
