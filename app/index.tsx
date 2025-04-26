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
import { AddIcon, ChevronRightIcon, Icon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import Fade from "@/components/Fade";
import EdgeFade from "@/components/EdgeFade";
import ReminderGroup from "@/components/reminder/ReminderGroup";
import { useNotifications } from "@/hooks/useNotifications";
import { Reminder } from "@/lib/reminders/reminders.types";
import { getReminders } from "@/lib/reminders/reminders.service";
import { NO_REMINDERS_DUE_TEXT } from "@/constants";

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
  const [accordiansOpen, setAccordiansOpen] = useState<string[]>(["upcoming"]);

  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const [nothingDueIndex] = useState(
    Math.floor(Math.random() * NO_REMINDERS_DUE_TEXT.length)
  );

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
    const data = await getReminders();
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
              emptyMessage={NO_REMINDERS_DUE_TEXT[nothingDueIndex]}
            />
            <ReminderGroup
              title="Upcoming"
              reminders={reminders.filter(
                (r) =>
                  !r.due_scheduled_at &&
                  !r.is_muted &&
                  !r.is_completed &&
                  !r.is_archived
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
            emptyMessage={NO_REMINDERS_DUE_TEXT[nothingDueIndex]}
          />
        );
      }
      case "upcoming": {
        return (
          <ReminderGroup
            reminders={reminders.filter(
              (r) =>
                !r.due_scheduled_at &&
                !r.is_muted &&
                !r.is_completed &&
                !r.is_archived
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
            reminders={reminders.filter((r) => r.is_muted && !r.is_archived)}
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
            emptyMessage={NO_REMINDERS_DUE_TEXT[nothingDueIndex]}
          />
        );
      }
    }
  }

  return (
    <ThemedContainer>
      <Box className="mb-2">
        <HStack className="justify-between items-start">
          <Heading size="3xl">Reminders</Heading>
        </HStack>
      </Box>

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
        {showRightFade && (
          <EdgeFade>
            {!showLeftFade && (
              <Box className="flex justify-center flex-1 items-end">
                <Icon as={ChevronRightIcon} className="text-typography-500" />
              </Box>
            )}
          </EdgeFade>
        )}
      </Box>
      <ScrollView>
        <FilterOptionReminders filterKey={currentFilter} />
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
