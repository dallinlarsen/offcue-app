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
import { Text } from "../ui/text";
import { Button, ButtonText } from "../ui/button";
import { Schedule } from "@/lib/schedules/schedules.types";

type Props = {
  schedule: Schedule;
  isOpen: boolean;
  block: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

export default function ({
  schedule,
  isOpen,
  onCancel,
  onDelete,
  block,
}: Props) {
  return (
    <AlertDialog isOpen={isOpen} onClose={onCancel}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading size="xl" className="font-quicksand-semibold">
            {block ? 'Cannot' : ''} Delete Schedule
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          {block ? (
            <Text size="lg" className="leading-6">
              This schedule cannot be deleted because it is being used by
              reminders. Please keep it archived instead.
            </Text>
          ) : (
            <Text size="lg" className="leading-6">
              Are you sure you want to delete the "{schedule.label}" schedule?
              This action cannot be undone.
            </Text>
          )}
        </AlertDialogBody>
        <AlertDialogFooter className="mt-4">
          <HStack space="sm">
            <Button
              variant="outline"
              className="flex-1"
              size="xl"
              onPress={onCancel}
            >
              <ButtonText>{block ? "Close" : "Cancel"}</ButtonText>
            </Button>
            {!block && (
              <Button
                action="primary"
                className="flex-1"
                size="xl"
                onPress={onDelete}
              >
                <ButtonText>Delete</ButtonText>
              </Button>
            )}
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
