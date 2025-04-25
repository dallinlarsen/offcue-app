import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(utc);
dayjs.extend(weekOfYear);

import * as source from "./notifications.source";

import { scheduleAllUpcomingNotifications } from "../device-notifications/device-notifications.service";
import { getReminder } from "../reminders/reminders.service";
import { getSchedulesByReminderId } from "../schedules/schedules.service";
import { NotificationResponseStatus } from "./notifications.types";

export {
  notificationsInit,
  deleteFutureNotificationsByReminderId,
  deleteNotificationsByReminderId,
  getUnrespondedNotificationsByReminderId,
  getSoonestFutureNotificationsToSchedule,
  getPastNotificationsByReminderId,
  getNextUpcomingNotificationByReminderId,
} from "./notifications.source";

/////////////////////////////////////////
////////// Notification Logic //////////
///////////////////////////////////////

// Function to create initial notifications for a newly created reminder.
// It calculates the number of intervals needed to get at least 'desiredCount' notifications.
// It then generates notifications per interval (filtering for future notifications) and persists them.
export const createInitialNotifications = async (
  reminderId: number,
  desiredCount: number = 10,
  bias: number = 0.5
): Promise<void> => {
  const reminder = await getReminder(reminderId);
  if (!reminder) {
    console.error(`Reminder with id ${reminderId} not found.`);
    return;
  }

  const schedules = await getSchedulesByReminderId(reminderId);
  if (!schedules || schedules.length === 0) {
    console.error(`No schedules defined for reminder ${reminderId}.`);
    return;
  }

  console.log(
    `Creating initial notifications: $${desiredCount} notifications.`
  );

  let startingIntervalIndex = 0;
  // If there is an existing next notification, use its interval_index as a starting point.
  const existingNext = await source.getNextNotificationByReminderId(reminderId);
  if (existingNext) {
    startingIntervalIndex = existingNext.interval_index;
  }

  let allNotifications: NotificationTime[] = [];
  let intervalIndex = startingIntervalIndex;

  let whileCounter = 0;
  // Loop until the desired number of notifications are reached.
  while (allNotifications.length < desiredCount) {
    // Generate notifications for this interval.
    let notifications = generateNotificationTimes(
      reminder,
      schedules,
      intervalIndex,
      bias
    );
    // Filter for future notifications (scheduled after the current time).
    const futureNotifications = notifications.filter((notif) =>
      dayjs(notif.scheduled_at).isAfter(dayjs())
    );
    if (futureNotifications.length > 0) {
      allNotifications.push(...futureNotifications);
    } else {
      console.log(
        `No future notifications found for interval ${intervalIndex}.`
      );
    }

    intervalIndex++;
    whileCounter++;

    if (whileCounter > 100) {
      throw new Error(
        'Caught in an infinite loop in "createInitialNotifications"'
      );
    }
  }

  if (allNotifications.length > 0) {
    await createNotifications(reminder, allNotifications);
    console.log(
      `✅ Created ${allNotifications.length} initial notifications for reminder ${reminderId}.`
    );
  } else {
    console.error("No notifications were created in the initial intervals.");
  }

  scheduleAllUpcomingNotifications();
};

// Function to recalculate (delete and recreate) all future notifications for a reminder.
// It deletes all notifications that haven't received a response and then recreates
// a fresh batch of at least 'desiredCount' notifications.
export const recalcFutureNotifications = async (
  reminderId: number,
  desiredCount: number = 10,
  bias: number = 0.5
): Promise<void> => {
  // Delete all future notifications (those without a response and scheduled in the future).
  await source.deleteFutureNotificationsByReminderId(reminderId);
  console.log(
    `Future notifications for reminder ${reminderId} have been deleted. Recalculating...`
  );

  // Create initial notifications anew.
  await createInitialNotifications(reminderId, desiredCount, bias);
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
        applies = schedule.is_sunday === 1;
        break;
      case 1:
        applies = schedule.is_monday === 1;
        break;
      case 2:
        applies = schedule.is_tuesday === 1;
        break;
      case 3:
        applies = schedule.is_wednesday === 1;
        break;
      case 4:
        applies = schedule.is_thursday === 1;
        break;
      case 5:
        applies = schedule.is_friday === 1;
        break;
      case 6:
        applies = schedule.is_saturday === 1;
        break;
    }
    if (applies) {
      // Combine the current date with the schedule’s start and end times (format: "HH:MM").
      const [startHour, startMinute] = schedule.start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = schedule.end_time.split(":").map(Number);
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
  // Ensure bias is within [0, 1]; default to 0.5 if not.
  if (bias < 0 || bias > 1) {
    bias = 0.5;
  }
  const u = Math.random();
  // Calculate the exponent for bias adjustment.
  // When bias equals 0.5 the exponent is 1; otherwise, adjust to skew the distribution.
  const exponent =
    bias === 0.5
      ? 1
      : bias < 0.5
      ? 1 + (0.5 - bias) * 2
      : 1 / (1 + (bias - 0.5) * 2);
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
  // console.log("Start:", localIntervalStart.toLocaleString());
  // console.log("End:", localIntervalEnd.toLocaleString());

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
    // console.log('No allowed minutes available in merged windows.');
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
      bias = 0.5;
    }
    const exponent =
      bias === 0.5
        ? 1
        : bias < 0.5
        ? 1 + (0.5 - bias) * 2
        : 1 / (1 + (bias - 0.5) * 2);
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
    await source.createNotification({
      reminder_id: reminder.id,
      scheduled_at: dayjs(notif.scheduled_at)
        .utc()
        .format("YYYY-MM-DD HH:mm:ssZ"),
      interval_index: notif.interval_index,
      segment_index: notif.segment_index,
    });
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
  console.log("Current Notification: ", currentNotification);
  const currentIntervalIndex = currentNotification[0].interval_index;
  console.log("Current Interval Index: ", currentIntervalIndex);

  // Delete all notifications in the current interval index
  await source.deleteNotificationsInInterval(reminderId, currentIntervalIndex);
};

export async function updateNotificationResponse(
  id: number,
  responseStatus: NotificationResponseStatus,
) {
  await source.updateNotification(id, {
    response_status: responseStatus,
    response_at: dayjs().format("YYYY-MM-DD hh:mmZ"),
  });

  const notification = await source.getNotification(id);
  if (notification?.reminder_id) {
    await source.updateAllPastDueNotificationsToNoReponseByReminderId(
      notification.reminder_id
    );
  }

  await scheduleAllUpcomingNotifications();
}

export async function undoOneTimeComplete(reminderId: number) {
  const lastDoneNotification = await source.getLastDoneNotificationByReminderId(
    reminderId
  );
  if (lastDoneNotification) {
    await updateNotificationResponse(
      lastDoneNotification.id,
      "later",
    );
  }

  await recalcFutureNotifications(reminderId);
}

export async function updateNotificationResponseOneTime(
  reminderId: number,
  responseStatus: NotificationResponseStatus
) {
  const notification = await source.getNextNotificationByReminderId(reminderId);
  if (!notification) return;

  await source.updateNotification(notification.id, {
    response_status: responseStatus,
    response_at: dayjs().format("YYYY-MM-DD hh:mmZ"),
  });

  await source.updateAllPastDueNotificationsToNoReponseByReminderId(reminderId);

  if (responseStatus === "done") {
    await source.updateNotification(notification.id, {
      scheduled_at: dayjs().utc().format("YYYY-MM-DD hh:mmZ"),
    });
    await source.deleteFutureNotificationsByReminderId(reminderId);
  }
  await scheduleAllUpcomingNotifications();
}
