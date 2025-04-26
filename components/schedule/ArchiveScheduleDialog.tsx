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
  onCancel: () => void;
  onArchive: () => void;
};

export default function ({
  schedule,
  isOpen,
  onCancel,
  onArchive,
}: Props) {
  return (
    <AlertDialog isOpen={isOpen} onClose={onCancel}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading size="xl" className="font-quicksand-semibold">
            Archive Schedule
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text size="lg" className="leading-6">
            Are you sure you want to archive the "{schedule.label}" schedule?
            This will remove it from the schedules you can select when creating
            a reminder.
          </Text>
        </AlertDialogBody>
        <AlertDialogFooter className="mt-4">
          <HStack space="sm">
            <Button
              variant="outline"
              className="flex-1"
              size="xl"
              onPress={onCancel}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              action="primary"
              className="flex-1"
              size="xl"
              onPress={onArchive}
            >
              <ButtonText>Archive</ButtonText>
            </Button>
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
