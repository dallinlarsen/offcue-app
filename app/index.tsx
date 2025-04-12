import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import { ScrollView } from "react-native";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon, Icon, SettingsIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { getAllReminders } from "@/lib/db-service";
import { chunkIntoPairs } from "@/lib/utils";
import { VStack } from "@/components/ui/vstack";
import { Reminder } from "@/lib/types";
import ReminderSelectCard from "@/components/reminder/ReminderSelectCard";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);

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
    setUpcomingReminders(reminders.filter((r) => !r.due_scheduled_at));
  }, [reminders]);

  return (
    <ThemedContainer>
      <Box className="mb-2">
        <Heading size="3xl">Reminders</Heading>
        <TouchableOpacity onPress={() => router.push('/notifications-test')}>
          <Icon as={SettingsIcon} />
        </TouchableOpacity>
        <Button
          onPress={async () => {
            await wipeDatabase();
            loadReminders();
          }}
        >
          <ButtonText>Wipe Database</ButtonText>
        </Button> */}
      </Box>
      <ScrollView>
        <VStack space="2xl">
          {dueReminders.length > 0 && (
            <VStack space="xs">
              <Heading size="xl">Due</Heading>
              <VStack space="lg">
                {chunkIntoPairs(dueReminders).map((p, idx) => (
                  <Box className="flex flex-row gap-4" key={idx}>
                    {p.map((r, idx) =>
                      r ? (
                        <ReminderSelectCard
                          key={r.id}
                          reminder={r}
                          onNotificationResponse={() => loadReminders()}
                        />
                      ) : (
                        <Box
                          key={`idx_${idx}`}
                          className="p-3 flex-1 aspect-square opacity-0"
                        />
                      )
                    )}
                  </Box>
                ))}
              </VStack>
            </VStack>
          )}
          {upcomingReminders.length > 0 && (
            <VStack space="xs">
              <Heading size="xl">Upcoming</Heading>
              <VStack space="lg">
                {chunkIntoPairs(upcomingReminders).map((p, idx) => (
                  <Box className="flex flex-row gap-4" key={idx}>
                    {p.map((r, idx) =>
                      r ? (
                        <ReminderSelectCard
                          key={r.id}
                          reminder={r}
                          onNotificationResponse={() => loadReminders}
                        />
                      ) : (
                        <Box
                          key={`idx_${idx}`}
                          className="p-3 flex-1 aspect-square opacity-0"
                        />
                      )
                    )}
                  </Box>
                ))}
              </VStack>
            </VStack>
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
