import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Icon, ArrowLeftIcon, TrashIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { getReminder } from "@/lib/db-service";
import AddEditReminder from "@/components/reminder/AddEditReminder";
import { Reminder } from "@/lib/types";
import { TouchableOpacity } from "react-native";
import DeleteReminderDialog from "@/components/reminder/DeleteReminderDialog";

export default function EditReminder() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function fetchReminder() {
    const data = await getReminder(parseInt(id as string));
    setReminder(data);
  }

  useEffect(() => {
    fetchReminder();
  }, []);

  return (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2 mb-4">
        <TouchableOpacity className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading size="3xl">Edit Reminder</Heading>
      </Box>
      {reminder ? (
        <>
          <DeleteReminderDialog
            reminder={reminder}
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          />
          <AddEditReminder
            data={reminder}
            onSave={() => router.back()}
            onCancel={() => router.back()}
            setDeleteDialogOpen={setDeleteDialogOpen}
          />
        </>
      ) : null}
    </ThemedContainer>
  );
}
