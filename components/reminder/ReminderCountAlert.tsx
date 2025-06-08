import { presentUnlimitedPaywall } from "@/lib/utils/paywall";
import { Alert } from "../ui/alert";
import { Button, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { VStack } from "../ui/vstack";
import WiggleAnimate from "../WiggleAnimate";

type Props = {
  recurringCount: number;
  taskCount: number;
};

export default function ({ recurringCount, taskCount }: Props) {

  return (
    <Alert className="mb-4 bg-background-100">
      <VStack className="flex-1" space="xs">
        <Heading size="xl" className="font-quicksand-bold">
          ⚠️{" "}
          {recurringCount + taskCount === 0 ? "No" : recurringCount + taskCount}{" "}
          Active Reminder
          {recurringCount + taskCount === 1 ? "" : "s"} Left
        </Heading>
        {/* <HStack space="md" className="items-center">
          <Icon as={RepeatIcon} />
          <Text>
            {recurringCount === 0 ? "No" : recurringCount} Recurring Reminder
            {recurringCount === 1 ? "" : "s"} Remaining
          </Text>
        </HStack>
        <HStack space="md" className="items-center">
          <Icon as={PushPinIcon} className="fill-typography-700" />
          <Text>
            {taskCount === 0 ? "No" : taskCount} Task Reminder
            {taskCount === 1 ? "" : "s"} Remaining
          </Text>
        </HStack> */}
        <WiggleAnimate>
          <Button
            size="lg"
            className="mt-4"
            onPress={presentUnlimitedPaywall}
          >
            <ButtonText>Go Unlimited 🚀</ButtonText>
          </Button>
        </WiggleAnimate>
      </VStack>
    </Alert>
  );
}
