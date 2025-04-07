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

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [reminders, setReminders] = useState<any[]>([]);

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

  const handleToggleMute = async (id: number, currentMuted: number) => {
    const newMuted = currentMuted ? false : true;
    await updateReminderMuted(id, newMuted);
    loadReminders(); // Refresh list after updating
  };

  return (
    <ThemedContainer>
      <Box className="mb-2">
        <Heading size="3xl">Reminders</Heading>
        <Button
          onPress={async () => {
            await wipeDatabase();
            loadReminders();
          }}
        >
          <ButtonText>Wipe Database</ButtonText>
        </Button>
      </Box>
      <ScrollView>
        <VStack space="lg">
          {chunkIntoPairs(reminders).map((p, idx) => (
            <Box className="flex flex-row gap-4" key={idx}>
              {p.map((r, idx) =>
                r ? (
                  <Card
                    key={idx}
                    variant="outline"
                    className="bg-background-50 p-3 flex-1 aspect-square justify-between"
                  >
                    <TouchableOpacity
                      onPress={() => router.push(`/reminder?id=${r.id}`)}
                    >
                      <VStack>
                        <Heading className="font-quicksand-bold" size="lg">
                          {r.title}
                        </Heading>
                        <Text>
                          {formatFrequencyString(
                            r.times,
                            r.interval_num,
                            r.interval_type
                          )}
                        </Text>
                        <Text>
                          {r.schedules
                            .map((s) =>
                              formatScheduleString(
                                s.start_time,
                                s.end_time,
                                [
                                  s.is_sunday && "sunday",
                                  s.is_monday && "monday",
                                  s.is_tuesday && "tuesday",
                                  s.is_wednesday && "wednesday",
                                  s.is_thursday && "thursday",
                                  s.is_friday && "friday",
                                  s.is_saturday && "saturday",
                                ].filter((d) => !!d)
                              )
                            )
                            .join("; ")}
                        </Text>
                      </VStack>
                    </TouchableOpacity>
                    <Box className="flex flex-row">
                      <Box className="flex-grow" />
                      <HStack space="sm" className="items-center">
                        <Text size="lg" className="font-quicksand-semibold">
                          Mute
                        </Text>
                        <Switch
                          value={r.is_muted === 1}
                          onValueChange={() =>
                            handleToggleMute(r.id, r.is_muted)
                          }
                          trackColor={{
                            false: colors.gray[300],
                            true: colors.gray[500],
                          }}
                          size="sm"
                          thumbColor={colors.gray[50]}
                          ios_backgroundColor={colors.gray[300]}
                        />
                      </HStack>
                    </Box>
                  </Card>
                ) : (
                  <Box
                    key={idx}
                    className="p-3 flex-1 aspect-square opacity-0"
                  />
                )
              )}
            </Box>
          ))}
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
