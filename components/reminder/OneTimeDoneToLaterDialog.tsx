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
import { Reminder, ReminderNotification } from "@/lib/types";
import { Text } from "@/components/ui/text";
import { updateNotificationResponse } from "@/lib/db-service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export default function ({
  isOpen,
  onClose,
  onContinue,
}: Props) {

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading size="xl" className="font-quicksand-semibold">
            Update Notification Status
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text size="lg" className="leading-7">
            By updating this status to "Later" this reminder will no longer be
            completed and reminder notifications will resume.
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
              onPress={onContinue}
            >
              <ButtonText>Continue</ButtonText>
            </Button>
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
