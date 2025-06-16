import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  DEFAULT_DESIRED_COUNT,
  DEFAULT_BIAS,
  MAX_ITERATION_LIMIT,
  UTC_DATE_FORMAT,
  LOCAL_DATE_FORMAT,
} from "./notifications.constants";

dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrAfter);

import * as source from "./notifications.source";

import {
  dismissFromNotificationCenter,
  scheduleAllUpcomingNotifications,
} from "../device-notifications/device-notifications.service";
import {
  getActiveReminders,
  getReminder,
  updateReminderArchived,
  isUnlimitedCheck,
} from "../reminders/reminders.service";
import { getSchedulesByReminderId } from "../schedules/schedules.service";
import { NotificationResponseStatus } from "./notifications.types";

export {
  notificationsInit,
  getUnrespondedNotificationsByReminderId,
  getSoonestFutureNotificationsToSchedule,
  getPastNotificationsByReminderId,
  getNextUpcomingNotificationByReminderId,
  deleteFutureNotificationsByReminderId,
  deleteNotificationsByReminderId,
} from "./notifications.source";

/////////////////////////////////////////
////////// Notification Logic //////////
///////////////////////////////////////

export const createInitialNotifications = async (
  reminderId: number,
  desiredCount: number = DEFAULT_DESIRED_COUNT,
  bias: number = DEFAULT_BIAS
): Promise<void> => {
  await ensureNotificationsForReminder(reminderId, desiredCount, bias);
  runNotificationMaintenance();
};

export const recalcFutureNotifications = async (
  reminderId: number,
  desiredCount: number = DEFAULT_DESIRED_COUNT,
  bias: number = DEFAULT_BIAS
): Promise<void> => {
  await source.deleteFutureNotificationsByReminderId(reminderId);
  console.log(
    `Deleted future notifications for ${reminderId}. Recalculating...`
  );
  await ensureNotificationsForReminder(reminderId, desiredCount, bias);
  await runNotificationMaintenance();
};

/**
 * Generate at least `desiredCount` future notification times for a reminder.
 * @throws if loop exceeds safe iteration count.
 */
async function generateFutureNotifications(
  reminder: any,
  schedules: any[],
  startingIntervalIndex: number,
  desiredCount: number,
  bias: number
): Promise<NotificationTime[]> {
  let intervalIndex = startingIntervalIndex;
  const allNotifications: NotificationTime[] = [];
  let iterations = 0;

  while (allNotifications.length < desiredCount) {
    // (exports as any) needed for jest to work properly with spyOn
    const notifications = (exports as any).generateNotificationTimes(
      reminder,
      schedules,
      intervalIndex,
      bias
    );
    const futureNotifications = notifications.filter(
      (n: {
        scheduled_at: string | number | dayjs.Dayjs | Date | null | undefined;
      }) =>
        dayjs(n.scheduled_at).isAfter(dayjs()) &&
        dayjs(n.scheduled_at).isSameOrAfter(dayjs(reminder.start_date))
    );

    if (futureNotifications.length > 0) {
      allNotifications.push(...futureNotifications);
    } else {
      console.log(`No future notifications for interval ${intervalIndex}.`);
    }

    intervalIndex++;
    if (++iterations > MAX_ITERATION_LIMIT) {
      throw new Error("generateFutureNotifications exceeded iteration limit");
    }
  }

  return allNotifications;
}

/**
 * Ensure a reminder has at least `desiredCount` notifications,
 * then persist them.
 */
export const ensureNotificationsForReminder = async (
  reminderId: number,
  desiredCount: number = DEFAULT_DESIRED_COUNT,
  bias: number = DEFAULT_BIAS
): Promise<void> => {
  // Fetch existing unresponded future notifications
  const existing = await source.getUnrespondedNotificationsByReminderId(
    reminderId
  );
  const existingCount = existing.length;
  if (existingCount >= desiredCount) {
    console.log(
      `Already have ${existingCount} future notifications for reminder ${reminderId}.`
    );
    return;
  }

  // Load reminder and schedules
  const reminder = await getReminder(reminderId);
  if (!reminder) {
    console.error(`Reminder ${reminderId} not found.`);
    return;
  }
  const schedules = await getSchedulesByReminderId(reminderId);
  if (!schedules || schedules.length === 0) {
    console.error(`No schedules for reminder ${reminderId}.`);
    return;
  }

  // Determine where to start generating additional notifications
  const startIntervalIndex =
    existingCount > 0
      ? Math.max(...existing.map((n) => n.interval_index)) + 1
      : 0;
  const missingCount = desiredCount - existingCount;

  // Generate and persist only the missing notifications
  const notifications = await generateFutureNotifications(
    reminder,
    schedules,
    startIntervalIndex,
    missingCount,
    bias
  );
  if (notifications.length > 0) {
    // (exports as any) needed for jest to work properly with spyOn
    await (exports as any).createNotifications(reminder, notifications);
    console.log(
      `Created ${notifications.length} new notifications for reminder ${reminderId}.`
    );
  }
};

//------------------------------------------------------------------------------
// # Utility Conversion Functions
//------------------------------------------------------------------------------

// Converts a UTC date (from the database) to local time.
export const convertToLocal = (date: Date): Date => {
  return dayjs.utc(date).local().toDate();
};

// Converts a local date (calculated internally) to UTC for persistence.
export const convertToUTC = (date: Date): Date => {
  return dayjs(date).utc().toDate();
};

//------------------------------------------------------------------------------
// # Module 1: Determine the Interval Index
//------------------------------------------------------------------------------

// Determines the new interval index for a reminder.
// If no notifications exist for this reminder, returns 0. Otherwise, returns
// nextNotification.interval_index + 1.
export const determineIntervalIndex = async (
  reminderId: number
): Promise<number> => {
  const nextNotification = await source.getNextNotificationByReminderId(
    reminderId
  );
  if (!nextNotification) {
    return 0;
  }
  return nextNotification.interval_index + 1;
};

//------------------------------------------------------------------------------
// # Module 2: Calculate the Current Interval Dates (Local Time)
//------------------------------------------------------------------------------

// Calculates the current interval boundaries (start and end) in local time.
// All arithmetic is done using the reminder’s creation date (converted to local)
// and then offset by (interval_num * intervalIndex) in the specified time unit.
export const calculateCurrentInterval = (
  reminder: any,
  intervalIndex: number
): { start: Date; end: Date } => {
  // Convert reminder.start_date from UTC to local.
  const localStartDate = convertToLocal(reminder.start_date);

  // Calculate the interval start: take the start-of the interval type on the
  // local start_date, then add (interval_num * intervalIndex).
  const localIntervalStart = dayjs(localStartDate)
    .startOf(reminder.interval_type as dayjs.OpUnitType)
    .add(
      reminder.interval_num * intervalIndex,
      reminder.interval_type as dayjs.ManipulateType
    )
    .toDate();

  // The interval end is calculated from the start plus one interval length,
  // subtracting 1ms for an exact boundary.
  const localIntervalEnd = dayjs(localIntervalStart)
    .add(reminder.interval_num, reminder.interval_type as dayjs.ManipulateType)
    .subtract(1, "millisecond")
    .toDate();

  return { start: localIntervalStart, end: localIntervalEnd };
};

//------------------------------------------------------------------------------
// # Module 3: Split Interval into Segments (Local Time)
//------------------------------------------------------------------------------

// Interface for a segment.
export interface Segment {
  start: Date;
  end: Date;
}

// Splits a given interval (in local time) into 'times' equal segments.
export const splitIntervalIntoSegments = (
  intervalStart: Date,
  intervalEnd: Date,
  times: number
): Segment[] => {
  const segments: Segment[] = [];
  const totalDuration = intervalEnd.getTime() - intervalStart.getTime();
  const segmentDuration = totalDuration / times;

  for (let segmentIndex = 0; segmentIndex < times; segmentIndex++) {
    const segStart = new Date(
      intervalStart.getTime() + segmentIndex * segmentDuration
    );
    const segEnd = new Date(segStart.getTime() + segmentDuration);
    segments.push({ start: segStart, end: segEnd });
  }
  return segments;
};

//------------------------------------------------------------------------------
// # Module 4: Process Schedule Windows
//------------------------------------------------------------------------------

// Returns the allowed time windows (in local time) for a given schedule that fall
// within the interval [intervalStart, intervalEnd].
export const getScheduleWindowsWithinInterval = (
  schedule: any,
  intervalStart: Date,
  intervalEnd: Date
): { start: Date; end: Date }[] => {
  const windows: { start: Date; end: Date }[] = [];

  // Work calendar-day by calendar-day based on the date part (ignore time-of-day)
  const startDate = new Date(intervalStart);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(intervalEnd);
  endDate.setHours(0, 0, 0, 0);

  for (
    let current = new Date(startDate);
    current <= endDate;
    current.setDate(current.getDate() + 1)
  ) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    let applies = false;
    switch (dayOfWeek) {
      case 0:
        applies = schedule.is_sunday;
        break;
      case 1:
        applies = schedule.is_monday;
        break;
      case 2:
        applies = schedule.is_tuesday;
        break;
      case 3:
        applies = schedule.is_wednesday;
        break;
      case 4:
        applies = schedule.is_thursday;
        break;
      case 5:
        applies = schedule.is_friday;
        break;
      case 6:
        applies = schedule.is_saturday;
        break;
    }
    if (applies) {
      // Determine start and end hours/minutes, treating identical times as all-day
      let startHour: number,
        startMinute: number,
        endHour: number,
        endMinute: number;
      if (schedule.start_time === schedule.end_time) {
        // All-day schedule: cover full day
        startHour = 0;
        startMinute = 0;
        endHour = 23;
        endMinute = 59;
      } else {
        [startHour, startMinute] = schedule.start_time.split(":").map(Number);
        [endHour, endMinute] = schedule.end_time.split(":").map(Number);
      }
      const windowStart = new Date(current);
      windowStart.setHours(startHour, startMinute, 0, 0);
      const windowEnd = new Date(current);
      windowEnd.setHours(endHour, endMinute, 0, 0);

      // Clamp the window so that it lies within the interval boundaries.
      if (windowEnd > intervalStart && windowStart < intervalEnd) {
        const clampedStart =
          windowStart < intervalStart ? new Date(intervalStart) : windowStart;
        const clampedEnd =
          windowEnd > intervalEnd ? new Date(intervalEnd) : windowEnd;
        if (clampedStart < clampedEnd) {
          windows.push({ start: clampedStart, end: clampedEnd });
        }
      }
    }
  }
  return windows;
};

// Merges overlapping windows into consolidated time ranges.
export const mergeTimeWindows = (
  windows: { start: Date; end: Date }[]
): { start: Date; end: Date }[] => {
  if (windows.length === 0) return [];
  // Sort windows by start time.
  windows.sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged = [windows[0]];
  for (let i = 1; i < windows.length; i++) {
    const last = merged[merged.length - 1];
    const current = windows[i];
    // If overlapping, extend the last window’s end time.
    if (current.start.getTime() <= last.end.getTime()) {
      last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
    } else {
      merged.push(current);
    }
  }
  return merged;
};

//------------------------------------------------------------------------------
// # Module 5: Determine Notification Time with UX Smoothing
//------------------------------------------------------------------------------

// Returns a biased random time within the specified segment (provided in local time),
// and converts the result back to UTC.
// - bias === 0.5 results in uniform randomness.
// - Values < 0.5 bias toward the start, values > 0.5 bias toward the end.
export const getBiasedRandomTime = (
  segmentStart: Date,
  segmentEnd: Date,
  bias: number
): Date => {
  // Ensure bias is within [0, 1]; default to DEFAULT_BIAS if not.
  if (bias < 0 || bias > 1) {
    bias = DEFAULT_BIAS;
  }
  const u = Math.random();
  // Calculate the exponent for bias adjustment.
  // When bias equals 0.5 the exponent is 1; otherwise, adjust to skew the distribution.
  const exponent =
    bias === DEFAULT_BIAS
      ? 1
      : bias < DEFAULT_BIAS
      ? 1 + (DEFAULT_BIAS - bias) * 2
      : 1 / (1 + (bias - DEFAULT_BIAS) * 2);
  const weight = Math.pow(u, exponent);

  // Calculate the scheduled time in local time.
  const localScheduledTime = new Date(
    segmentStart.getTime() +
      weight * (segmentEnd.getTime() - segmentStart.getTime())
  );
  // Convert back to UTC for storage.
  return convertToUTC(localScheduledTime);
};

//------------------------------------------------------------------------------
// # Module 6: Map Segments to Schedules and Generate Notifications
//------------------------------------------------------------------------------

// Interface for a notification time.
export interface NotificationTime {
  scheduled_at: string;
  interval_index: number;
  segment_index: number;
}

// Generates notification times for the reminder for a specific interval (in UTC).
// This function performs all logic in local time and converts final times back to UTC.
// It uses the minute-based approach that accounts for overlapping and disjoint schedule windows.
export const generateNotificationTimes = (
  reminder: any,
  schedules: any[],
  intervalIndex: number,
  bias: number
): NotificationTime[] => {
  // Calculate the current interval boundaries in local time.
  const { start: localIntervalStart, end: localIntervalEnd } =
    calculateCurrentInterval(reminder, intervalIndex);

  // Get allowed schedule windows for the entire interval from all schedules.
  let allowedWindows: { start: Date; end: Date }[] = [];
  schedules.forEach((schedule) => {
    allowedWindows = allowedWindows.concat(
      getScheduleWindowsWithinInterval(
        schedule,
        localIntervalStart,
        localIntervalEnd
      )
    );
  });

  // Merge overlapping windows
  const mergedWindows = mergeTimeWindows(allowedWindows);

  // Calculate total allowed minutes from mergedWindows
  let totalAllowedMinutes = 0;
  mergedWindows.forEach((window) => {
    const durationMinutes = Math.floor(
      (window.end.getTime() - window.start.getTime()) / (60 * 1000)
    );
    totalAllowedMinutes += durationMinutes;
  });

  if (totalAllowedMinutes === 0) {
    return [];
  }

  // Divide the total allowed minutes into segments based on reminder.times
  const segmentsMinutes = Math.floor(totalAllowedMinutes / reminder.times);
  const notifications: NotificationTime[] = [];

  // For each segment, generate a biased random offset and map it into an actual time
  for (let segmentIndex = 0; segmentIndex < reminder.times; segmentIndex++) {
    const minOffset = segmentIndex * segmentsMinutes;
    const maxOffset = (segmentIndex + 1) * segmentsMinutes;

    // Generate a random number with bias within this segment
    let u = Math.random();
    if (bias < 0 || bias > 1) {
      bias = DEFAULT_BIAS;
    }
    const exponent =
      bias === DEFAULT_BIAS
        ? 1
        : bias < DEFAULT_BIAS
        ? 1 + (DEFAULT_BIAS - bias) * 2
        : 1 / (1 + (bias - DEFAULT_BIAS) * 2);
    const weight = Math.pow(u, exponent);
    const offsetInSegment = Math.floor(
      minOffset + weight * (maxOffset - minOffset)
    );

    // Map the offset (in minutes) to an actual local time by traversing the mergedWindows
    let remainingOffset = offsetInSegment;
    let scheduledLocalTime: Date | null = null;

    for (let window of mergedWindows) {
      const windowDurationMinutes = Math.floor(
        (window.end.getTime() - window.start.getTime()) / (60 * 1000)
      );
      if (remainingOffset < windowDurationMinutes) {
        // Found the window where the offset falls
        scheduledLocalTime = new Date(
          window.start.getTime() + remainingOffset * 60 * 1000
        );
        break;
      } else {
        remainingOffset -= windowDurationMinutes;
      }
    }

    if (scheduledLocalTime) {
      // Convert the scheduled local time back to UTC for storage
      const scheduledTimeUTC = convertToUTC(scheduledLocalTime);
      notifications.push({
        scheduled_at: scheduledTimeUTC.toISOString(),
        interval_index: intervalIndex,
        segment_index: segmentIndex,
      });
    } else {
      console.log(
        `Failed to map offset ${offsetInSegment} for segment ${segmentIndex}`
      );
    }
  }

  return notifications;
};

//------------------------------------------------------------------------------
// # Module 7: Persist Notifications
//------------------------------------------------------------------------------

// Loops over the generated notifications and persists each notification.
// The first notification (segment_index === 0) is flagged as isScheduled.
export const createNotifications = async (
  reminder: any,
  notifications: NotificationTime[]
): Promise<void> => {
  for (const notif of notifications) {
    try {
      await source.createNotification({
        reminder_id: reminder.id,
        scheduled_at: dayjs(notif.scheduled_at).utc().format(UTC_DATE_FORMAT),
        interval_index: notif.interval_index,
        segment_index: notif.segment_index,
      });
    } catch (e: any) {
      if (
        e.message.includes("UNIQUE constraint failed") ||
        e.message.includes("SQLITE_CONSTRAINT")
      ) {
        console.log(
          `Skipped duplicate notification for reminder ${reminder.id}, interval ${notif.interval_index}, segment ${notif.segment_index}`
        );
      } else {
        throw e;
      }
    }
  }
};

// Force the recreation of notifications
// First delete the existing notifications in the current interval index
// Then create new notifications
export const deleteNotificationsInInterval = async (
  reminderId: number
): Promise<void> => {
  // Get the interval index of the reminder
  const currentNotification =
    await source.getUnrespondedNotificationsByReminderId(reminderId);
  const currentIntervalIndex = currentNotification[0].interval_index;

  // Delete all notifications in the current interval index
  await source.deleteNotificationsInInterval(reminderId, currentIntervalIndex);
};

export async function updateNotificationResponse(
  id: number,
  responseStatus: NotificationResponseStatus
) {
  await source.updateNotification(id, {
    response_status: responseStatus,
    response_at: dayjs().format(LOCAL_DATE_FORMAT),
  });

  const notification = await source.getNotification(id);
  if (notification?.reminder_id) {
    await source.updateAllPastDueNotificationsToNoReponseByReminderId(
      notification.reminder_id
    );
  }

  dismissFromNotificationCenter(id);
  await runNotificationMaintenance();
}

export async function updateNotificationResponseOneTime(
  reminderId: number,
  responseStatus: NotificationResponseStatus
) {
  const notification = await source.getNextNotificationByReminderId(reminderId);
  if (!notification) return;

  await source.updateNotification(notification.id, {
    response_status: responseStatus,
    response_at: dayjs().format(LOCAL_DATE_FORMAT),
  });

  await source.updateAllPastDueNotificationsToNoReponseByReminderId(reminderId);

  if (responseStatus === "done") {
    await source.updateNotification(notification.id, {
      scheduled_at: dayjs().utc().format(LOCAL_DATE_FORMAT),
    });
    await source.deleteFutureNotificationsByReminderId(reminderId);
  } else {
    await runNotificationMaintenance();
  }

  const pastNotifications = await source.getPastNotificationsByReminderId(
    reminderId
  );

  for (const pastNotification of pastNotifications) {
    dismissFromNotificationCenter(pastNotification.id);
  }
}

export async function undoOneTimeComplete(reminderId: number) {
  if (!(await isUnlimitedCheck("task"))) return;

  const lastDoneNotification = await source.getLastDoneNotificationByReminderId(
    reminderId
  );
  if (lastDoneNotification) {
    await updateNotificationResponse(lastDoneNotification.id, "later");
  }

  await runNotificationMaintenance();
}

/**
 * Run full notification maintenance:
 * 1. Archive expired reminders and delete their future notifications.
 * 2. Ensure active reminders have at least 10 notifications.
 * 3. Schedule all upcoming notifications in the system.
 */
export const runNotificationMaintenance = async () => {
  const reminders = await getActiveReminders();
  const today = dayjs();

  // Archive expired and clean up
  for (const rem of reminders) {
    if (rem.end_date && dayjs(rem.end_date).isBefore(today, "day")) {
      await updateReminderArchived(rem.id, true);
      const cutoff = dayjs(rem.end_date).utc().format(UTC_DATE_FORMAT);
      await source.deleteNotificationsAfterDate(rem.id, cutoff);
    }
  }
  // Ensure notifications for active
  for (const rem of reminders.filter((r) => !r.is_archived)) {
    try {
      await ensureNotificationsForReminder(rem.id);
    } catch (e) {
      console.error(e);
    }
  }
  // Finally, schedule all
  scheduleAllUpcomingNotifications();
};
