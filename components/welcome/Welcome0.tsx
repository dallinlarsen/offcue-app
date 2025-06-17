import { useAssets } from "expo-asset";
import { Box } from "../ui/box";
import { Heading } from "../ui/heading";
import { Image } from "expo-image";
import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronRightIcon } from "../ui/icon";
import { ScrollView } from "react-native";
import { requestNotificationsPermission } from "@/lib/device-notifications/device-notifications.service";
import { Text } from "../ui/text";

type Props = {
  onNext: () => void;
};

export default function Welcome0({ onNext }: Props) {
  const [assets, error] = useAssets([
    require("@/assets/images/splash-icon.png"),
    require("@/assets/images/splash-icon-dark.png"),
  ]);

  function nextPressedHandler() {
    requestNotificationsPermission();
    onNext();
  }

  return (
    <VStack className="justify-between flex-1">
      <ScrollView>
        <Box>
          <Heading size="4xl" className="text-center flex-none mt-6">
            Welcome to
          </Heading>
          <Box className="flex dark:hidden">
            {assets?.[0] && (
              <Image
                source={assets[0]}
                style={{
                  height: 120,
                  marginTop: 16,
                  marginBottom: 16,
                }}
                contentFit="contain"
              />
            )}
          </Box>
          <Box className="hidden dark:flex">
            {assets?.[1] && (
              <Image
                source={assets[1]}
                style={{
                  height: 120,
                  marginTop: 16,
                  marginBottom: 16,
                }}
                contentFit="contain"
              />
            )}
          </Box>
        </Box>
        <VStack space="2xl" className="px-1 mt-5">
          <Text size="2xl" className="leading-relaxed">
            The app that helps{" "}
            <Heading size="xl" className="font-quicksand-bold">
              build habits 🚀
            </Heading>{" "}
            and{" "}
            <Heading size="xl" className="font-quicksand-bold">
              get things done ✅
            </Heading>
            , without all the fluff.
          </Text>
          <Text size="2xl" className="leading-relaxed">
            <Heading size="2xl">1{"\t"}</Heading> To get the most out of this
            app, please{" "}
            <Heading size="xl" className="font-quicksand-bold">
              allow notifications 🔔
            </Heading>{" "}
            when prompted.
          </Text>
          <Text size="2xl" className="leading-relaxed">
            <Heading size="2xl">2{"\t"}</Heading> Tap{" "}
            <Heading size="xl" className="font-quicksand-bold">
              "Begin Tutorial"
            </Heading>{" "}
            below to get started! 🎉
          </Text>
        </VStack>
      </ScrollView>
      <Button size="xl" onPress={nextPressedHandler}>
        <ButtonText>Begin Tutorial</ButtonText>
        <ButtonIcon as={ChevronRightIcon} />
      </Button>
    </VStack>
  );
}
