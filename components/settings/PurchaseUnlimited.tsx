import React from "react";
import { Button, ButtonText } from "../ui/button";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { VStack } from "../ui/vstack";
import { Text } from "../ui/text";
import { HStack } from "../ui/hstack";
import WiggleAnimate from "../WiggleAnimate";
import { useStore } from "@nanostores/react";
import { $hasUnlimited } from "@/lib/stores/revenueCat";
import { presentUnlimitedPaywall } from "@/lib/utils/paywall";

export default function PurchaseUnlimited({
  className,
}: {
  className?: string;
}) {
  const hasUnlimited = useStore($hasUnlimited);

  return (
    <>
      {hasUnlimited ? (
        <></>
      ) : (
        <Card
          variant="filled"
          className={`bg-background-100 rounded-xl ${className || ""}`}
        >
          <Heading size="xl" className="font-quicksand-bold">
            Unlimited
          </Heading>
          <VStack space="md" className="my-2">
            <HStack space="sm">
              <Text size="3xl">🚀</Text>
              <VStack>
                <Heading size="lg" className="font-quicksand-bold">
                  Set Unlimited Reminders
                </Heading>
                <Text className="max-w-[98%]">
                  Get 1 task and 2 recurring reminders on us. Go unlimited when you are ready.
                </Text>
              </VStack>
            </HStack>
            <HStack space="sm">
              <Text size="3xl">☁️</Text>
              <VStack className="w-fit">
                <Heading size="lg" className="font-quicksand-bold">
                  iCloud Backup
                </Heading>
                <Text className="max-w-[98%]">
                  Your reminders, always safe and synced with iCloud.
                </Text>
              </VStack>
            </HStack>
          </VStack>
          <WiggleAnimate>
            <Button
              size="xl"
              className="mt-2"
              onPress={presentUnlimitedPaywall}
            >
              <ButtonText>Get Unlimited</ButtonText>
            </Button>
          </WiggleAnimate>
        </Card>
      )}
    </>
  );
}
