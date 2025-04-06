import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import { FlatList, TouchableOpacity, StyleSheet, View } from "react-native";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";
import colors from "tailwindcss/colors";
import { fetchReminders, updateReminderMuted, wipeDatabase } from "@/lib/database";
import { Button, ButtonText } from "@/components/ui/button";

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [reminders, setReminders] = useState<any[]>([]);

  const loadReminders = async () => {
    const data = await fetchReminders();
    setReminders(data);
    // console.log(data);
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

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={styles.reminderBox} onPress={() => { }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.frequency}>
          {item.times === 1 ? "1 time" : `${item.times} times`} every{" "}
          {item.interval_num === 1 ? "1 minute" : `${item.interval_num} ${item.interval_type}`}{" "}
        </Text>
        <View style={styles.muteContainer}>
          <Text style={styles.muteLabel}>Mute</Text>
          <Switch
            value={item.is_muted === 1}
            onValueChange={() => handleToggleMute(item.id, item.is_muted)}
            trackColor={{ false: colors.gray[300], true: colors.gray[500] }}
            thumbColor={colors.gray[50]}
            ios_backgroundColor={colors.gray[300]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedContainer>
      <Box style={styles.header}>
        <Heading size="3xl">Reminders</Heading>
      </Box>
      <Button
        onPress={async () => {
          await wipeDatabase();
          loadReminders();
        }}
      >
        <ButtonText>Wipe Database</ButtonText>
      </Button>
      <FlatList
        data={
          reminders.length % 2 === 0
            ? reminders
            : [...reminders, { id: "placeholder", isPlaceholder: true }]
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          item.isPlaceholder ? (
            <View style={[styles.reminderBox, styles.placeholderBox]} />
          ) : (
            renderItem({ item })
          )
        }
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
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

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  reminderBox: {
    flex: 1,
    backgroundColor: "#fff", // Adjust this if your boxes have a different background color
    margin: 8,
    padding: 16,
    borderRadius: 12, // Increase the border radius for more rounded corners
    aspectRatio: 1, // Keeps the box square
    justifyContent: "space-between",
    // Adjusted shadow properties for a more subtle drop shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  placeholderBox: {
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 20, // Slightly larger font if needed
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  frequency: {
    fontSize: 16,
    marginTop: 4,
    color: "#555",
  },
  muteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  muteLabel: {
    marginRight: 8,
    fontSize: 14,
    color: "#666",
  },
});