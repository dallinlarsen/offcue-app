import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon, Icon, MenuIcon, SettingsIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { getAllReminders } from "@/lib/db-service";
import { VStack } from "@/components/ui/vstack";
import { Reminder } from "@/lib/types";
import { HStack } from "@/components/ui/hstack";
import ReminderGroupDropDown from "@/components/reminder/ReminderGroupDropDown";
import Fade from "@/components/Fade";
import EdgeFade from "@/components/EdgeFade";

type CurrentFilterOptions =
  | "all"
  | "due"
  | "upcoming"
  | "completed"
  | "muted"
  | "archived";

type FilterOptionProps = {
  onPress: () => void;
  label: string;
  active?: boolean;
};

function FilterOption({ onPress, label, active }: FilterOptionProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Heading
        size="xl"
        className={`${
          active ? "text-typography-950" : "text-typography-500"
        } pr-6`}
      >
        {label}
      </Heading>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [mutedReminders, setMutedReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  const [accordiansOpen, setAccordiansOpen] = useState<string[]>(["upcoming"]);

  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const [currentFilter, setCurrentFilter] =
    useState<CurrentFilterOptions>("all");

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const totalContentWidth = contentSize.width;
    const visibleWidth = layoutMeasurement.width;

    setShowLeftFade(scrollX > 0);
    setShowRightFade(scrollX + visibleWidth < totalContentWidth - 0);
  };

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
      reminders.filter(
        (r) => !r.due_scheduled_at && !r.is_muted && !r.is_completed
      )
    );
    setMutedReminders(reminders.filter((r) => r.is_muted));
    setCompletedReminders(reminders.filter((r) => r.is_completed));
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
          {/* <TouchableOpacity
            className="p-3"
            onPress={() => router.push("/notifications-test")}
          >
            <Icon as={SettingsIcon} size="xl" />
          </TouchableOpacity> */}
        </HStack>
      </Box>
      <Box className="relative">
        <ScrollView
          horizontal
          className="flex-grow-0"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <HStack>
            <FilterOption
              label="All Current"
              onPress={() => setCurrentFilter("all")}
              active={currentFilter === "all"}
            />
            <FilterOption
              label="Due"
              onPress={() => setCurrentFilter("due")}
              active={currentFilter === "due"}
            />
            <FilterOption
              label="Upcoming"
              onPress={() => setCurrentFilter("upcoming")}
              active={currentFilter === "upcoming"}
            />
            <FilterOption
              label="Muted"
              onPress={() => setCurrentFilter("muted")}
              active={currentFilter === "muted"}
            />
            <FilterOption
              label="Completed"
              onPress={() => setCurrentFilter("completed")}
              active={currentFilter === "completed"}
            />
            <FilterOption
              label="Archived"
              onPress={() => setCurrentFilter("archived")}
              active={currentFilter === "archived"}
            />
          </HStack>
        </ScrollView>
        {showLeftFade && <EdgeFade left />}
        {showRightFade && <EdgeFade />}
      </Box>
      <ScrollView>
        <VStack space="sm">
          <ReminderGroupDropDown
            title="Due"
            reminders={dueReminders}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            persist
            emptyMessage="Nothing’s Due—You’re Doing Great! 👍"
          />
          <ReminderGroupDropDown
            title="Upcoming"
            reminders={upcomingReminders}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            open={accordiansOpen.includes("upcoming")}
            setOpen={(open) => setOpenHandler(open, "upcoming")}
            emptyMessage="No Upcoming Reminders."
          />
          {completedReminders.length > 0 && (
            <ReminderGroupDropDown
              title="Completed"
              reminders={completedReminders}
              onNotificationResponse={() => loadReminders()}
              onMuted={() => loadReminders()}
              open={accordiansOpen.includes("completed")}
              setOpen={(open) => setOpenHandler(open, "completed")}
            />
          )}
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
        placement="bottom right"
        onPress={() => router.push("/new-reminder")}
      >
        <FabIcon size="xl" as={AddIcon} />
      </Fab>
      <Fade />
    </ThemedContainer>
  );
}
