import React, { useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Icon, ArrowLeftIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import AddEditReminder from "@/components/reminder/AddEditReminder";
import { IntervalType, Reminder } from "@/lib/types";
import { TouchableOpacity } from "react-native";

export default function NewReminder() {
  const router = useRouter();

  const blankReminder: Reminder = {
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
    start_date: '',
    end_date: '',
    updated_at: '',
  };

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2 mb-2">
        <TouchableOpacity className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading size="3xl">New Reminder</Heading>
      </Box>
      <AddEditReminder data={blankReminder} onSave={() => router.back()} />
    </ThemedContainer>
  );
}
