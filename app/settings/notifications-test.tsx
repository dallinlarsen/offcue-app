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
import { wipeDatabase } from "@/lib/db-service";
import {
  createDeviceNotification,
  getAllScheduledNotifications,
} from "@/lib/device-notifications.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { NotificationRequest } from "expo-notifications";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

dayjs.extend(utc);

export default function NotificationsTest() {
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

  async function createNotificationForTest() {
    try {
      const result = await createDeviceNotification({
        title: "This is a test",
        body: "Hello there",
        utcTimestamp: dayjs()
          .utc()
          .add(10, "second")
          .utc()
          .format("YYYY-MM-DD HH:mm:ss"),
        identifier: undefined,
        categoryIdentifier: "reminder-actions-recurring",
        data: { someData: "Hello" },
      });
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
      <VStack space="sm">
        <Text>Creates notification 10 seconds from now</Text>
        <HStack space="md">
          <Button
            onPress={createNotificationForTest}
            className="flex-1"
            size="md"
          >
            <ButtonText>Create</ButtonText>
          </Button>
          <Button onPress={getAllNotifications} className="flex-1" size="md">
            <ButtonText>View All</ButtonText>
          </Button>
        </HStack>
        <HStack space="md">
          <Button
            onPress={wipeDatabase}
            variant="outline"
            className="flex-1"
            size="md"
          >
            <ButtonText>Wipe DB</ButtonText>
          </Button>
        </HStack>
      </VStack>
      <Text>Total: {allNotifications.length}</Text>
      <ScrollView>
        <Box className="rounded overflow-hidden w-full border border-background-300 mt-4">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-5">ID</TableHead>
                <TableHead>Seconds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allNotifications
                .sort((a, b) =>
                  dayjs(a.original.content.data.scheduledAt).isAfter(
                    dayjs(b.original.content.data.scheduledAt)
                  )
                    ? 1
                    : -1
                )
                .map((n, idx) => (
                  <TableRow key={idx}>
                    <TableData className="w-5">{n.identifier}</TableData>
                    <TableData>
                      {JSON.stringify(n.original.content.data.scheduledAt)}
                    </TableData>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      </ScrollView>
    </ThemedContainer>
  );
}
