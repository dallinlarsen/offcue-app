import { useState, useEffect, useCallback, useRef } from "react";
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
import { HStack } from "@/components/ui/hstack";
import Fade from "@/components/Fade";
import EdgeFade from "@/components/EdgeFade";
import ReminderGroup from "@/components/reminder/ReminderGroup";
import { useNotifications } from "@/hooks/useNotifications";
import { Reminder } from "@/lib/reminders/reminders.types";
import {
  getActiveReminderCounts,
  getReminders,
} from "@/lib/reminders/reminders.service";
import { NO_REMINDERS_DUE_TEXT, REMINDER_LIMIT } from "@/constants";
import PagerView from "react-native-pager-view";
import {
  DirectEventHandler,
  Double,
} from "react-native/Libraries/Types/CodegenTypes";
import React from "react";
import { useStore } from "@nanostores/react";
import ReminderCountAlert from "@/components/reminder/ReminderCountAlert";
import { $entitlementsLoading, $hasUnlimited } from "@/lib/stores/revenueCat";
import { presentUnlimitedPaywall } from "@/lib/utils/paywall";

type CurrentFilterOptions =
  | "current"
  | "due"
  | "upcoming"
  | "completed"
  | "muted"
  | "archived";

const FILTERS: { key: CurrentFilterOptions; label: string }[] = [
  { key: "current", label: "Current" },
  { key: "due", label: "Due" },
  { key: "upcoming", label: "Upcoming" },
  { key: "muted", label: "Muted" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { lastNotification } = useNotifications();
  const hasUnlimited = useStore($hasUnlimited);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [recurringCount, setRecurringCount] = useState(1);
  const [taskCount, setTaskCount] = useState(1);
  const [noMoreReminders, setNoMoreReminders] = useState(false);

  useEffect(
    () =>
      setNoMoreReminders(
        !hasUnlimited && recurringCount <= 0 && taskCount <= 0
      ),
    [recurringCount, taskCount, hasUnlimited]
  );

  const [nothingDueIndex] = useState(
    Math.floor(Math.random() * NO_REMINDERS_DUE_TEXT.length)
  );

  const [currentFilter, setCurrentFilter] =
    useState<CurrentFilterOptions>("current");
  const pagerRef = useRef<PagerView | null>(null);
  const filterScrollViewRef = useRef<ScrollView | null>(null);
  const filterRefs = useRef(FILTERS.map(() => React.createRef()));

  const loadReminders = async () => {
    const data = await getReminders();
    const counts = await getActiveReminderCounts();
    setRecurringCount(REMINDER_LIMIT.recurring - counts.recurring);
    setTaskCount(REMINDER_LIMIT.task - counts.task);
    setReminders(data);
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

  const scrollFilterIntoView = (index: number) => {
    //@ts-ignore
    filterRefs.current[index]?.current?.measureLayout(
      filterScrollViewRef.current,
      (x: number) => {
        filterScrollViewRef?.current?.scrollTo({ x: x - 40, animated: true });
      }
    );
  };

  const handleTabPress = (filter: CurrentFilterOptions, idx: number) => {
    setCurrentFilter(filter);
    pagerRef.current?.setPage(idx);
    scrollFilterIntoView(idx);
  };

  // When a page is swiped, update the filter
  const handlePageSelected: DirectEventHandler<
    Readonly<{
      position: Double;
    }>
  > = (e) => {
    const index = e.nativeEvent.position;
    setCurrentFilter(FILTERS[index].key);
    scrollFilterIntoView(index);
  };

  function FilterOptionReminders({
    filterKey,
  }: {
    filterKey: CurrentFilterOptions;
  }) {
    switch (filterKey) {
      case "current": {
        return (
          <ReminderGroup
            reminders={[
              {
                title: "Due",
                reminders: reminders.filter((r) => r.due_scheduled_at),
                emptyMessage: NO_REMINDERS_DUE_TEXT[nothingDueIndex],
              },
              {
                title: "Upcoming",
                reminders: reminders.filter(
                  (r) =>
                    !r.due_scheduled_at &&
                    !r.is_muted &&
                    !r.is_completed &&
                    !r.is_archived
                ),
                emptyMessage: "No Upcoming Reminders.",
              },
            ]}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
          />
        );
      }
      case "due": {
        return (
          <ReminderGroup
            reminders={[
              {
                title: "",
                reminders: reminders.filter((r) => r.due_scheduled_at),
                emptyMessage: NO_REMINDERS_DUE_TEXT[nothingDueIndex],
              },
            ]}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
          />
        );
      }
      case "upcoming": {
        return (
          <ReminderGroup
            reminders={[
              {
                title: "",
                reminders: reminders.filter(
                  (r) =>
                    !r.due_scheduled_at &&
                    !r.is_muted &&
                    !r.is_completed &&
                    !r.is_archived
                ),
                emptyMessage: "No Upcoming Reminders.",
              },
            ]}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
          />
        );
      }
      case "muted": {
        return (
          <ReminderGroup
            reminders={[
              {
                title: "",
                reminders: reminders
                  .filter((r) => r.is_muted && !r.is_archived)
                  .reverse(),
                emptyMessage: "No Muted Reminders.",
              },
            ]}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
          />
        );
      }
      case "completed": {
        return (
          <ReminderGroup
            reminders={[
              {
                title: "",
                reminders: reminders.filter((r) => r.is_completed).reverse(),
                emptyMessage: "No Completed Reminders.",
              },
            ]}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
          />
        );
      }
      case "archived": {
        return (
          <ReminderGroup
            reminders={[
              {
                title: "",
                reminders: reminders.filter((r) => r.is_archived).reverse(),
                emptyMessage: "No Archived Reminders.",
              },
            ]}
            onNotificationResponse={() => loadReminders()}
            onMuted={() => loadReminders()}
          />
        );
      }
      default: {
        return null;
      }
    }
  }

  return (
    <ThemedContainer>
      <Box className="mb-1">
        <HStack className="justify-between items-start">
          <Heading size="2xl">Reminders</Heading>
        </HStack>
      </Box>

      {noMoreReminders && (
        <ReminderCountAlert
          recurringCount={recurringCount}
          taskCount={taskCount}
        />
      )}

      <Box className="relative mb-4 -mx-3">
        <ScrollView
          horizontal
          className="flex-grow-0"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          ref={filterScrollViewRef}
        >
          <Box className="w-3" />
          {FILTERS.map((filter, idx) => (
            <TouchableOpacity
              onPress={() => handleTabPress(filter.key, idx)}
              /* @ts-ignore */
              ref={filterRefs.current[idx]}
              key={filter.key}
            >
              <Heading
                size="xl"
                className={`${
                  currentFilter === filter.key
                    ? "text-typography-950"
                    : "text-typography-500"
                } pr-6`}
              >
                {filter.label}
              </Heading>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <EdgeFade left />
        <EdgeFade />
      </Box>

      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePageSelected}
        ref={pagerRef}
        pageMargin={42}
      >
        {FILTERS.map((filter) => (
          <FilterOptionReminders key={filter.key} filterKey={filter.key} />
        ))}
      </PagerView>

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
