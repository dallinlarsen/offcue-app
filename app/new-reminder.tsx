import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Icon, ArrowLeftIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import AddEditReminder from "@/components/reminder/AddEditReminder";
import { TouchableOpacity } from "react-native";
import {
  InsertReminder,
  IntervalType,
  Reminder,
} from "@/lib/reminders/reminders.types";
import { Schedule } from "@/lib/schedules/schedules.types";
import { getReminder } from "@/lib/reminders/reminders.service";
import omit from "lodash/omit";

export default function NewReminder() {
  const router = useRouter();
  const { copy } = useLocalSearchParams<{ copy?: string }>();
  const [showForm, setShowForm] = useState(false);

  const reminder = useRef<InsertReminder & { schedules: Schedule[] }>({
    title: "",
    description: "",
    interval_num: "" as any,
    interval_type: "" as IntervalType,
    times: "" as any,
    schedules: [],
    track_streak: false,
    track_notes: false,
    is_recurring: true,
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    async function getCopyReminder() {
      if (copy) {
        const copyReminder = await getReminder(parseInt(copy));
        reminder.current = {
          ...omit(copyReminder, ["id"]),
          start_date: "",
          end_date: "",
        };
      }
      setShowForm(true);
    }
    getCopyReminder();
  }, []);

  function goBackHandler() {
    router.dismissTo("/");
  }

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2 mb-2 -ml-4">
        <TouchableOpacity className="p-3" onPress={goBackHandler}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading size="2xl">New Reminder</Heading>
      </Box>
      {showForm && (
        <AddEditReminder
          data={reminder.current}
          onSave={() => router.dismissTo("/")}
        />
      )}
    </ThemedContainer>
  );
}
