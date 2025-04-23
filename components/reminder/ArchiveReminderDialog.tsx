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
import { Reminder } from "@/lib/types";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { updateReminderArchived } from "@/lib/db-service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder;
  onArchiveSuccess: () => void;
};

export default function ({ reminder, isOpen, onClose, onArchiveSuccess }: Props) {
  const router = useRouter();

  async function archiveReminderHandler() {
    await updateReminderArchived(reminder.id!, true);
    console.log('HERE')
    onArchiveSuccess();
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
            Archive "{reminder.title}"
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text size="lg" className="leading-7">
            Are you sure you want to archive this reminder?
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
              onPress={() => archiveReminderHandler()}
            >
              <ButtonText>
                Archive
              </ButtonText>
            </Button>
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
