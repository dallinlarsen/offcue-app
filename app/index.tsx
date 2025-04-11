import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";
import colors from "tailwindcss/colors";
import {
  getAllReminders,
  updateReminderMuted,
  wipeDatabase,
} from "@/lib/db-service";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  chunkIntoPairs,
  formatFrequencyString,
  formatScheduleString,
} from "@/lib/utils";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Reminder } from "@/lib/types";
import ReminderSelectCard from "@/components/reminder/ReminderSelectCard";

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
        {/* <Button
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
                        <ReminderSelectCard key={r.id} reminder={r} />
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
                        <ReminderSelectCard key={r.id} reminder={r} />
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
      </ScrollView>
      <Fab
        size="lg"
        placement="bottom center"
        onPress={() => router.push("/new-reminder")}
      >
        <FabIcon size="xl" as={AddIcon} />
      </Fab>
    </ThemedContainer>
  );
}
