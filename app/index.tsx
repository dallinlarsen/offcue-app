import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { getAllReminders } from "@/lib/db-service";
import { VStack } from "@/components/ui/vstack";
import { Reminder } from "@/lib/types";
import { HStack } from "@/components/ui/hstack";
import ReminderGroupDropDown from "@/components/reminder/ReminderGroupDropDown";
import Fade from "@/components/Fade";
import EdgeFade from "@/components/EdgeFade";
import ReminderGroup from "@/components/reminder/ReminderGroup";
import { getUserSettings } from "@/lib/db-source";
import { useNotifications } from "@/hooks/useNotifications";

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
  const router = useRouter();
  const { lastNotification } = useNotifications();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [mutedReminders, setMutedReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  const [archivedReminders, setArchivedReminders] = useState<Reminder[]>([]);
  const [accordiansOpen, setAccordiansOpen] = useState<string[]>(["upcoming"]);
  const [isFilterNav, setIsFilterNav] = useState<boolean | null>(null);

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
    const userSettings = await getUserSettings();
    setIsFilterNav(userSettings.filter_reminder_nav);
    setReminders(data);
    console.log(data);
  };

  // Refresh reminders whenever the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  useEffect(() => {
    if (lastNotification) {
      setTimeout(() => loadReminders(), 1000);
    }
  }, [lastNotification]);

  useEffect(() => {
    setDueReminders(reminders.filter((r) => r.due_scheduled_at));
    setUpcomingReminders(
      reminders.filter(
        (r) => !r.due_scheduled_at && !r.is_muted && !r.is_completed && !r.is_archived
      )
    );
    setMutedReminders(reminders.filter((r) => r.is_muted));
    setArchivedReminders(reminders.filter((r) => r.is_archived));
    setCompletedReminders(reminders.filter((r) => r.is_completed));
  }, [reminders]);

  function setOpenHandler(open: boolean, key: string) {
    if (open && !accordiansOpen.includes(key)) {
      setAccordiansOpen([...accordiansOpen, key]);
    } else {
      setAccordiansOpen(accordiansOpen.filter((k) => k !== key));
    }
  }

  function FilterOptionReminders({
    filterKey,
  }: {
    filterKey: CurrentFilterOptions;
  }) {
    switch (filterKey) {
      case "all": {
        return (
          <VStack space="xl">
            <ReminderGroup
              title="Due"
              reminders={reminders.filter((r) => r.due_scheduled_at)}
              onNotificationResponse={() => loadReminders()}
              onMuted={() => loadReminders()}
              emptyMessage="Nothing’s Due—You’re Doing Great! 👍"
            />
            <ReminderGroup
              title="Upcoming"
              reminders={reminders.filter(
                (r) => !r.due_scheduled_at && !r.is_muted && !r.is_completed && !r.is_archived
              )}
              onNotificationResponse={() => loadReminders()}
              onMuted={() => loadReminders()}
              emptyMessage="No Upcoming Reminders."
            />
          </VStack>
        );
      }
      case "due": {
        return (
          <ReminderGroup
            reminders={reminders.filter((r) => r.due_scheduled_at)}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            emptyMessage="Nothing’s Due—You’re Doing Great! 👍"
          />
        );
      }
      case "upcoming": {
        return (
          <ReminderGroup
            reminders={reminders.filter(
              (r) => !r.due_scheduled_at && !r.is_muted && !r.is_completed && !r.is_archived
            )}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            emptyMessage="No Upcoming Reminders."
          />
        );
      }
      case "muted": {
        return (
          <ReminderGroup
            reminders={reminders.filter((r) => r.is_muted)}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            emptyMessage="No Muted Reminders."
          />
        );
      }
      case "completed": {
        return (
          <ReminderGroup
            reminders={reminders.filter((r) => r.is_completed)}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            emptyMessage="No Completed Reminders."
          />
        );
      }
      case "archived": {
        return (
          <ReminderGroup
            reminders={reminders.filter((r) => r.is_archived)}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            emptyMessage="No Archived Reminders."
          />
        );
      }
      default: {
        return (
          <ReminderGroup
            reminders={reminders}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
            emptyMessage="Nothing’s Due—You’re Doing Great! 👍"
          />
        );
      }
    }
  }

  return isFilterNav === null ? (
    <ThemedContainer />
  ) : (
    <ThemedContainer>
      <Box className="mb-2">
        <HStack className="justify-between items-start">
          <Heading size="3xl">Reminders</Heading>
        </HStack>
      </Box>
      {isFilterNav && (
        <Box className="relative mb-4">
          <ScrollView
            horizontal
            className="flex-grow-0"
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <HStack>
              <FilterOption
                label="Current"
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
                label="Completed"
                onPress={() => setCurrentFilter("completed")}
                active={currentFilter === "completed"}
              />
              <FilterOption
                label="Muted"
                onPress={() => setCurrentFilter("muted")}
                active={currentFilter === "muted"}
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
      )}
      <ScrollView>
        {isFilterNav ? (
          <FilterOptionReminders filterKey={currentFilter} />
        ) : (
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
            {archivedReminders.length > 0 && (
              <ReminderGroupDropDown
                title="Archived"
                reminders={archivedReminders}
                onNotificationResponse={() => loadReminders()}
                onMuted={() => loadReminders()}
                open={accordiansOpen.includes("archived")}
                setOpen={(open) => setOpenHandler(open, "archived")}
              />
            )}
          </VStack>
        )}
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
