import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import { ScrollView, TouchableOpacity } from "react-native";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Fab, FabIcon } from "@/components/ui/fab";
import {
  AddIcon,
  Icon,
  SettingsIcon,
} from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { getAllReminders } from "@/lib/db-service";
import { VStack } from "@/components/ui/vstack";
import { Reminder } from "@/lib/types";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { HStack } from "@/components/ui/hstack";
import ReminderGroupDropDown from "@/components/reminder/ReminderGroupDropDown";

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [mutedReminders, setMutedReminders] = useState<Reminder[]>([]);
  const [accordiansOpen, setAccordiansOpen] = useState<string[]>(["upcoming"]);

  const loadReminders = async () => {
    const data = await getAllReminders();
    setReminders(data);
    console.log(data);
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadReminders();
  }, [navigation]);

  // Refresh reminders whenever the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  useEffect(() => {
    setDueReminders(reminders.filter((r) => r.due_scheduled_at));
    setUpcomingReminders(
      reminders.filter((r) => !r.due_scheduled_at && !r.is_muted)
    );
    setMutedReminders(reminders.filter((r) => r.is_muted));
  }, [reminders]);

  function setOpenHandler(open: boolean, key: string) {
    if (open && !accordiansOpen.includes(key)) {
      setAccordiansOpen([...accordiansOpen, key]);
    } else {
      setAccordiansOpen(accordiansOpen.filter((k) => k !== key));
    }
  }

  return (
    <ThemedContainer>
      <Box className="mb-2">
        <HStack className="justify-between items-start">
          <Heading size="3xl">Reminders</Heading>
          <TouchableOpacity
            className="p-3"
            onPress={() => router.push("/notifications-test")}
          >
            <Icon as={SettingsIcon} size="xl" />
          </TouchableOpacity>
        </HStack>
      </Box>
      <ScrollView>
        <VStack space="sm">
          <ReminderGroupDropDown
            title="Due"
            reminders={dueReminders}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            persist
            emptyMessage="No Reminders Due! 👍"
          />
          <ReminderGroupDropDown
            title="Upcoming"
            reminders={upcomingReminders}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            open={accordiansOpen.includes("upcoming")}
            setOpen={(open) => setOpenHandler(open, "upcoming")}
            emptyMessage="No Upcoming Reminders"
          />
          {mutedReminders.length > 0 && (
            <ReminderGroupDropDown
              title="Muted"
              reminders={mutedReminders}
              onNotificationResponse={() => loadReminders()}
              onMuted={() => loadReminders()}
              open={accordiansOpen.includes("muted")}
              setOpen={(open) => setOpenHandler(open, "muted")}
            />
          )}
        </VStack>
        <Box className="h-36"></Box>
      </ScrollView>
      <Fab
        size="lg"
        placement="bottom center"
        onPress={() => router.push("/new-reminder")}
      >
        <FabIcon size="xl" as={AddIcon} />
      </Fab>
      <Box
        className="absolute bottom-0 right-0 left-0 h-40 dark:h-0"
        pointerEvents="none"
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(251, 251, 251, 0)",
            "rgba(251, 251, 251, .5)",
            "rgba(251, 251, 251, .7)",
            "rgba(251, 251, 251, .9)",
            "rgba(251, 251, 251, 1)",
          ]}
          style={styles.background}
        />
      </Box>
      <Box
        className="absolute bottom-0 right-0 left-0 h-0 dark:h-40"
        pointerEvents="none"
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(24, 23, 25, 0)",
            "rgba(24, 23, 25, .5)",
            "rgba(24, 23, 25, .7)",
            "rgba(24, 23, 25, .9)",
            "rgba(24, 23, 25, 1)",
          ]}
          style={styles.background}
        />
      </Box>
    </ThemedContainer>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});
