import { VStack } from "../ui/vstack";
import { ScrollView } from "react-native";
import Fade from "../Fade";
import { InsertSchedule } from "@/lib/schedules/schedules.types";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronRightIcon } from "../ui/icon";

const SCHEDULES_TO_CHOOSE = [
  
];

type Props = {
  onNext: (schedules: InsertSchedule[]) => void;
};

export default function SchedulesSelect7({ onNext }: Props) {
  function nextPressedHandler() {
    onNext([]);
  }

  return (
    <VStack className="justify-between flex-1">
      <ScrollView showsVerticalScrollIndicator={false}></ScrollView>
      <Fade />
      <Button size="xl" onPress={nextPressedHandler}>
        <ButtonText>Next</ButtonText>
        <ButtonIcon as={ChevronRightIcon} />
      </Button>
    </VStack>
  );
}
