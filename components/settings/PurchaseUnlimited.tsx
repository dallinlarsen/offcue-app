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
                  Get 1 current task reminder and 2 current recurring reminders
                  on us.
                </Text>
                <Text className="max-w-[98%] mt-2">
                  Go Unlimited when you're ready!
                </Text>
              </VStack>
            </HStack>
            <HStack space="sm">
              <Text size="3xl">😅</Text>
              <VStack className="w-fit">
                <Heading size="lg" className="font-quicksand-bold">
                  Backup Your Data
                </Heading>
                <Text className="max-w-[98%]">
                  Download your data so that you can restore it later or on a
                  different device.
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
