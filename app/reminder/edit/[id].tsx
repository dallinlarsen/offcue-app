import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Icon, ArrowLeftIcon, TrashIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import AddEditReminder from "@/components/reminder/AddEditReminder";
import { TouchableOpacity } from "react-native";
import Fade from "@/components/Fade";
import ArchiveReminderDialog from "@/components/reminder/ArchiveReminderDialog";
import { getReminder } from "@/lib/reminders/reminders.service";
import { Reminder } from "@/lib/reminders/reminders.types";

export default function EditReminder() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  async function fetchReminder() {
    const data = await getReminder(parseInt(id as string));
    setReminder(data);
  }

  useEffect(() => {
    fetchReminder();
  }, []);

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2 mb-2">
        <TouchableOpacity className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading size="3xl">Edit Reminder</Heading>
      </Box>
      <Fade />
      {reminder ? (
        <>
          <ArchiveReminderDialog
            reminder={reminder}
            isOpen={archiveDialogOpen}
            onClose={() => setArchiveDialogOpen(false)}
            onArchiveSuccess={() =>
              router.dismissTo(`/reminder/${reminder.id!}`)
            }
          />
          <AddEditReminder
            data={reminder}
            onSave={() => router.dismissTo(`/reminder/${reminder.id!}`)}
            onCancel={() => router.back()}
            setArchiveDialogOpen={setArchiveDialogOpen}
          />
        </>
      ) : null}
    </ThemedContainer>
  );
}
