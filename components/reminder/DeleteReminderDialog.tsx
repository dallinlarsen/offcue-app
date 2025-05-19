import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "../ui/alert-dialog";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Button, ButtonText } from "../ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { Reminder } from "@/lib/reminders/reminders.types";
import { deleteReminder } from "@/lib/reminders/reminders.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder;
};

export default function ({ reminder, isOpen, onClose }: Props) {
  const router = useRouter();

  async function deleteReminderHandler() {
    await deleteReminder(reminder.id!);
    router.dismissTo('/');
  }

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading
            numberOfLines={1}
            size="xl"
            className="font-quicksand-semibold"
          >
            Delete "{reminder.title}"
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text size="lg" className="leading-7">
            Are you sure you want to delete this reminder? This action is{" "}
            <Text size="lg" className="font-bold">
              permanent
            </Text>{" "}
            and{" "}
            <Text size="lg" className="font-bold">
              cannot be undone.
            </Text>
          </Text>
        </AlertDialogBody>
        <AlertDialogFooter className="mt-4">
          <HStack space="sm">
            <Button
              variant="outline"
              className="flex-1"
              size="xl"
              onPress={() => onClose()}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              className="flex-1"
              size="xl"
              onPress={() => deleteReminderHandler()}
            >
              <ButtonText>Delete</ButtonText>
            </Button>
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
