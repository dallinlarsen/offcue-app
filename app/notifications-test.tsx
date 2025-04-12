import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ArrowLeftIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  createDeviceNotification,
  getAllScheduledNotifications,
} from "@/lib/device-notifications.service";
import dayjs from "dayjs";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

export default function NotificationsTest() {
  const navigation = useNavigation();
  const router = useRouter();

  const [allNotifications, setAllNotifications] = useState<object[]>([]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  async function createNotificationForTest() {
    await createDeviceNotification(
      "This is a test",
      "Hello there",
      "1234",
      dayjs().add(1, "minute").format("YYYY-MM-DD hh:mm"),
      "reminder-actions",
      { someData: "Hello" }
    );
  }

  async function getAllNotifications() {
    const notifications = await getAllScheduledNotifications();

    setAllNotifications(notifications);
  }

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2 mb-4">
        <TouchableOpacity className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading size="3xl">Notifications Test</Heading>
      </Box>
      <VStack space="xs">
        <Text>Creates notification 1 minute from now</Text>
        <HStack space="md">
          <Button
            onPress={createNotificationForTest}
            className="flex-1"
            size="md"
          >
            <ButtonText>Create Notification</ButtonText>
          </Button>
          <Button onPress={getAllNotifications} className="flex-1" size="md">
            <ButtonText>View All Notifications</ButtonText>
          </Button>
        </HStack>
      </VStack>
      {allNotifications.map((n, idx) => (
        <Text key={idx}>{JSON.stringify(n)}</Text>
      ))}
    </ThemedContainer>
  );
}
