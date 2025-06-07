import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Button, ButtonText } from "../ui/button";
import { presentPaywallIfNeeded } from "@/lib/utils/paywall";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { VStack } from "../ui/vstack";
import { Text } from "../ui/text";
import { HStack } from "../ui/hstack";
import { useCustomerInfo } from "@/hooks/useCustomerInfo";

export default function PurchaseUnlimited({ className }: {className: string}) {
  const rotation = useSharedValue(0);

  const { customerInfo, refetch, loading } = useCustomerInfo();

  useEffect(() => {
    const triggerWiggle = () => {
      rotation.value = withSequence(
        withTiming(-5, { duration: 80, easing: Easing.linear }),
        withTiming(5, { duration: 80, easing: Easing.linear }),
        withTiming(-3, { duration: 60, easing: Easing.linear }),
        withTiming(3, { duration: 60, easing: Easing.linear }),
        withTiming(0, { duration: 60, easing: Easing.linear })
      );
    };

    const timeout = setTimeout(() => {
      triggerWiggle();
      const interval = setInterval(triggerWiggle, 10000); // every 10 sec
      // clear interval on unmount
      return () => clearInterval(interval);
    }, 5000); // wait 5 seconds on mount

    // clear timeout on unmount
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {

  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <>
      {customerInfo?.entitlements?.active?.Unlimited || loading ? (
        <></>
      ) : (
        <Card variant="filled" className={`bg-background-100 rounded-xl ${className}`}>
          <Heading size="xl" className="font-quicksand-bold">
            Offcue Unlimited
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
          <Animated.View style={animatedStyle}>
            <Button
              size="xl"
              className="mt-2"
              onPress={async () => {
                await presentPaywallIfNeeded("com.offcueapps.offcue.Unlimited");
                refetch();
              }
              }
            >
              <ButtonText>Get Unlimited</ButtonText>
            </Button>
          </Animated.View>
        </Card>
      )}
    </>
  );
}
