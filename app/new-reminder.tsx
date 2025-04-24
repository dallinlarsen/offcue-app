import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Icon, ArrowLeftIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import AddEditReminder from "@/components/reminder/AddEditReminder";
import { IntervalType, Reminder } from "@/lib/types";
import { TouchableOpacity } from "react-native";
import { getReminder } from "@/lib/db-service";

export default function NewReminder() {
  const router = useRouter();
  const { copy } = useLocalSearchParams<{ copy?: string }>();
  const [showForm, setShowForm] = useState(false);

  const reminder = useRef<Reminder>({
    title: "",
    description: "",
    interval_num: "" as any,
    interval_type: "" as IntervalType,
    times: "" as any,
    schedules: [],
    track_streak: false,
    track_notes: false,
    is_muted: false,
    due_scheduled_at: null,
    due_notification_id: null,
    created_at: "",
    is_recurring: true,
    is_completed: false,
    is_archived: false,
    start_date: "",
    end_date: "",
    updated_at: "",
  });

  useEffect(() => {
    async function getCopyReminder() {
      if (copy) {
        const copyReminder = await getReminder(parseInt(copy));
        reminder.current = {
          ...copyReminder,
          is_muted: false,
          due_scheduled_at: null,
          due_notification_id: null,
          created_at: "",
          is_completed: false,
          is_archived: false,
          start_date: "",
          end_date: "",
          updated_at: "",
          id: undefined,
        };
      }
      setShowForm(true);
    }
    getCopyReminder();
  }, []);

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2 mb-2">
        <TouchableOpacity className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading size="3xl">New Reminder</Heading>
      </Box>
      {showForm && (
        <AddEditReminder
          data={reminder.current}
          onSave={(reminderId: number) =>
            router.dismissTo(`/reminder/${reminderId}`)
          }
        />
      )}
    </ThemedContainer>
  );
}
