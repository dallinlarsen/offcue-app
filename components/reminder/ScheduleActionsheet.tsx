import { useEffect, useState } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "../ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { AddIcon } from "../ui/icon";
import { AddScheduleActionsheet } from "./AddScheduleActionsheet";
import useWatch from "@/hooks/useWatch";

type ScheduleActionsheetProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ScheduleActionsheet({
  isOpen,
  setIsOpen,
}: ScheduleActionsheetProps) {
  const [addOpen, setAddOpen] = useState(false);

  const handleNewSchedulePressed = () => {
    setAddOpen(true);
    setIsOpen(false);
  };

  useWatch(addOpen, (newVal, oldVal) => {
    if (!newVal && oldVal) {
      setIsOpen(true);
    }
  });

  return (
    <>
      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="items-start">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Heading size="xl" className="mb-2">
            Schedules
          </Heading>
          <Button
            className="w-full"
            size="xl"
            onPress={handleNewSchedulePressed}
          >
            <ButtonIcon as={AddIcon} />
            <ButtonText>New Schedule</ButtonText>
          </Button>
        </ActionsheetContent>
      </Actionsheet>
      <AddScheduleActionsheet isOpen={addOpen} setIsOpen={setAddOpen} />
    </>
  );
}
