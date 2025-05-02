import { ThemedContainer } from "@/components/ThemedContainer";
import { Fab, FabIcon } from "@/components/ui/fab";
import {

  PencilIcon,
} from "@/components/ui/icon";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import ReminderDetails from "@/components/reminder/ReminderDetails";
import Fade from "@/components/Fade";
import { useNotifications } from "@/hooks/useNotifications";
import { Reminder } from "@/lib/reminders/reminders.types";
import { getReminder } from "@/lib/reminders/reminders.service";
import ScrollingHeader from "@/components/ScrollingHeader";

export default function ReminderDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { lastNotification } = useNotifications();

  const [reminder, setReminder] = useState<Reminder | null>(null);

  async function fetchData() {
    const data = await getReminder(parseInt(id as string));
    setReminder(data);
  }

  useEffect(() => {
    if (lastNotification) {
      setTimeout(() => fetchData(), 1000);
    }
  }, [lastNotification]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  function goBackHandler() {
    if (router.canGoBack()) {
      router.back();
    } else router.replace("/");
  }

  return reminder ? (
    <ThemedContainer className="-mt-2">
      <ScrollingHeader text={reminder.title} goBack={goBackHandler} />
      <ReminderDetails
        reminder={reminder}
        onNotificationResponse={() => fetchData()}
      />
      {!reminder.is_completed && !reminder.is_archived && (
        <Fab size="lg" onPress={() => router.push(`/reminder/edit/${id}`)}>
          <FabIcon as={PencilIcon} size="xl" className="fill-typography-50" />
        </Fab>
      )}
      <Fade />
    </ThemedContainer>
  ) : (
    <ThemedContainer />
  );
}
