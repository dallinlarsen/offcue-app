import React from "react";
import { Button, ButtonText } from "../ui/button";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { VStack } from "../ui/vstack";
import { Text } from "../ui/text";
import { HStack } from "../ui/hstack";
import WiggleAnimate from "../WiggleAnimate";
import { useRevenueCat } from "@/hooks/useRevenueCat";

export default function PurchaseUnlimited({
  className,
}: {
  className?: string;
}) {
  const { hasUnlimited, loading, presentPaywallIfNeeded } = useRevenueCat();

  return (
    <>
      {hasUnlimited || loading ? (
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
                <Text className="max-w-[90%]">
                  Your habit-building potential could be limitless
                </Text>
              </VStack>
            </HStack>
            <HStack space="sm">
              <Text size="3xl">☁️</Text>
              <VStack className="w-fit">
                <Heading size="lg" className="font-quicksand-bold">
                  iCloud Backup
                </Heading>
                <Text className="max-w-[90%]">
                  Never stress about losing your reminders again with syncing
                  through iCloud
                </Text>
              </VStack>
            </HStack>
          </VStack>
          <WiggleAnimate>
            <Button
              size="xl"
              className="mt-2"
              onPress={() =>
                presentPaywallIfNeeded("com.offcueapps.offcue.Unlimited")
              }
            >
              <ButtonText>Get Unlimited</ButtonText>
            </Button>
          </WiggleAnimate>
        </Card>
      )}
    </>
  );
}
