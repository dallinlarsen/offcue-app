import { presentUnlimitedPaywall } from "@/lib/revenue-cat/revenue-cat.service";
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
          Current Reminder
          {recurringCount + taskCount === 1 ? "" : "s"} Left
        </Heading>
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
