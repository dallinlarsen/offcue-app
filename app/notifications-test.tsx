import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ArrowLeftIcon, Icon } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  cancelScheduledNotifications,
  createDeviceNotification,
  getAllScheduledNotifications,
} from "@/lib/device-notifications.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { NotificationRequest } from "expo-notifications";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

dayjs.extend(utc);

export default function NotificationsTest() {
  const navigation = useNavigation();
  const router = useRouter();

  const [allNotifications, setAllNotifications] = useState<
    {
      identifier: string;
      title: string | null;
      body: string | null;
      data: Record<string, any>;
      original: NotificationRequest;
    }[]
  >([]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  async function createNotificationForTest() {
    try {
      const result = await createDeviceNotification(
        "This is a test",
        "Hello there",
        dayjs().utc().add(1, "minute").format("YYYY-MM-DD HH:mm:ss"),
        undefined,
        "reminder-actions",
        { someData: "Hello" }
      );
    } catch (e) {
      console.error(e);
    }
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
        <Button
          className="mt-2"
          variant="outline"
          onPress={cancelScheduledNotifications}
        >
          <ButtonText>Cancel All Notifications</ButtonText>
        </Button>
      </VStack>
      <Box className="rounded overflow-hidden w-full border border-background-300 mt-4">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Seconds</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allNotifications.map((n, idx) => (
              <TableRow key={idx}>
                <TableData>{n.identifier}</TableData>
                <TableData>{parseInt(n.original.trigger.seconds)}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </ThemedContainer>
  );
}
