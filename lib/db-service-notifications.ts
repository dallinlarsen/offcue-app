import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

import * as db_source from './db-source';

/////////////////////////////////////////////
////////// CRUD for notifications //////////
///////////////////////////////////////////

export { createNotification, getNotification, updateNotification, deleteNotification } from "./db-source";

/////////////////////////////////////////
////////// Notification Logic //////////
///////////////////////////////////////

// Integration flow for processing reminder notifications:
export const processReminderNotifications = async (reminderId: number, bias: number = 0.5): Promise<void> => {
  try {
    // 1. Fetch the reminder record.
    const reminder = await db_source.getReminder(reminderId);
    if (!reminder) {
      console.error(`Reminder with id ${reminderId} not found.`);
      return;
    }
    console.log("Reminder fetched:", reminder);

    // 2. Determine the current interval index.
    const intervalIndex = await determineIntervalIndex(reminderId);
    console.log("Determined interval index:", intervalIndex);

    // 3. (Optional) You can calculate and log the interval boundaries.
    const { start, end } = calculateCurrentInterval(reminder, intervalIndex);
    console.log("Calculated local interval boundaries:");
    console.log(`   Start: ${start.toLocaleString()}`);
    console.log(`   End:   ${end.toLocaleString()}`);

    // 4. Retrieve the schedules for the reminder.
    const schedules = await db_source.getReminderSchedules(reminderId);
    if (!schedules || schedules.length === 0) {
      console.error("No schedules defined for this reminder. Aborting notification generation.");
      return;
    }
    console.log("Schedules fetched:", schedules);

    // 5. Generate new notification times for the next interval.
    const timeoutSeconds = 10;
    const startTime = Date.now();
    let attemptIntervalIndex = intervalIndex;  // Start with current interval index
    let newNotifications = generateNotificationTimes(reminder, schedules, attemptIntervalIndex, bias);

    while(newNotifications.length === 0 && (Date.now() - startTime) < timeoutSeconds * 1000) {
      console.log(`No notifications generated for interval ${attemptIntervalIndex}. Trying next interval.`);
      attemptIntervalIndex++;
      newNotifications = generateNotificationTimes(reminder, schedules, attemptIntervalIndex, bias);
    }
    if(newNotifications.length === 0) {
      console.error(`No allowed windows found in available intervals after ${timeoutSeconds} seconds.`);
      return;
    }
    console.log("Generated notifications:", newNotifications);

    // Filter out notifications that are scheduled in the past and loop until we have future notifications
    let futureNotifications = newNotifications.filter((notif) => Date.parse(notif.scheduled_at) > Date.now());
    while (futureNotifications.length === 0 && (Date.now() - startTime) < timeoutSeconds * 1000) {
      console.log(`No future notifications generated for interval ${attemptIntervalIndex}. Trying next interval.`);
      attemptIntervalIndex++;
      newNotifications = generateNotificationTimes(reminder, schedules, attemptIntervalIndex, bias);
      futureNotifications = newNotifications.filter((notif) => Date.parse(notif.scheduled_at) > Date.now());
    }
    if (futureNotifications.length === 0) {
      console.error(`No allowed windows found in available intervals after ${timeoutSeconds} seconds.`);
      return;
    }

    // 6. Persist the new notifications in the database.
    //    Each notification has a scheduled_at timestamp (in UTC), interval index, and segment index.
    await createNotifications(reminder, futureNotifications);
    console.log(`Notifications for interval ${attemptIntervalIndex} have been created.`);

  } catch (error) {
    console.error("Error processing reminder notifications:", error);
    throw error;
  }
};

// Function to create initial notifications for a newly created reminder.
// It calculates the number of intervals needed to get at least 'desiredCount' notifications.
// It then generates notifications per interval (filtering for future notifications) and persists them.
export const createInitialNotifications = async (
  reminderId: number,
  desiredCount: number = 10,
  bias: number = 0.5
): Promise<void> => {
  const reminder = await db_source.getReminder(reminderId);
  if (!reminder) {
    console.error(`Reminder with id ${reminderId} not found.`);
    return;
  }
  
  const schedules = await db_source.getReminderSchedules(reminderId);
  if (!schedules || schedules.length === 0) {
    console.error(`No schedules defined for reminder ${reminderId}.`);
    return;
  }
  
  // Calculate the number of intervals required.
  // Each interval yields reminder.times notifications.
  const notificationsPerInterval = reminder.times;
  const requiredIntervals = Math.ceil(desiredCount / notificationsPerInterval);
  console.log(`Creating initial notifications: ${requiredIntervals} intervals to yield at least ${desiredCount} notifications.`);
  
  let startingIntervalIndex = 0;
  // If there is an existing next notification, use its interval_index as a starting point.
  const existingNext = await db_source.getNextNotification(reminderId);
  if (existingNext) {
    startingIntervalIndex = existingNext.interval_index;
  }
  
  let allNotifications: NotificationTime[] = [];
  // Loop through the required number of intervals.
  for (let i = 0; i < requiredIntervals; i++) {
    const intervalIndex = startingIntervalIndex + i;
    // Generate notifications for this interval.
    let notifications = generateNotificationTimes(reminder, schedules, intervalIndex, bias);
    // Filter for future notifications (scheduled after the current time).
    const futureNotifications = notifications.filter((notif) => Date.parse(notif.scheduled_at) > Date.now());
    if (futureNotifications.length > 0) {
      allNotifications.push(...futureNotifications);
    } else {
      console.log(`No future notifications found for interval ${intervalIndex}.`);
    }
  }
  
  if (allNotifications.length > 0) {
    await createNotifications(reminder, allNotifications);
    console.log(`✅ Created ${allNotifications.length} initial notifications for reminder ${reminderId}.`);
  } else {
    console.error("No notifications were created in the initial intervals.");
  }
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
  await db_source.deleteFutureNotifications(reminderId);
  console.log(`Future notifications for reminder ${reminderId} have been deleted. Recalculating...`);
  
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
export const determineIntervalIndex = async (reminderId: number): Promise<number> => {
  const nextNotification = await db_source.getNextNotification(reminderId);
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
  // Convert reminder.created_at from UTC to local.
  const localCreatedAt = convertToLocal(reminder.created_at);

  // Calculate the interval start: take the start-of the interval type on the
  // local created_at, then add (interval_num * intervalIndex).
  const localIntervalStart = dayjs(localCreatedAt)
    .startOf(reminder.interval_type as dayjs.OpUnitType)
    .add(reminder.interval_num * intervalIndex, reminder.interval_type as dayjs.ManipulateType)
    .toDate();

  // The interval end is calculated from the start plus one interval length,
  // subtracting 1ms for an exact boundary.
  const localIntervalEnd = dayjs(localIntervalStart)
    .add(reminder.interval_num, reminder.interval_type as dayjs.ManipulateType)
    .subtract(1, 'millisecond')
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
    const segStart = new Date(intervalStart.getTime() + segmentIndex * segmentDuration);
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
  // Work day-by-day from intervalStart until the end.
  const current = new Date(intervalStart);
  while (current <= intervalEnd) {
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
      const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
      const [endHour, endMinute] = schedule.end_time.split(':').map(Number);
      const windowStart = new Date(current);
      windowStart.setHours(startHour, startMinute, 0, 0);
      const windowEnd = new Date(current);
      windowEnd.setHours(endHour, endMinute, 0, 0);

      // Clamp the window so that it lies within the interval boundaries.
      if (windowEnd > intervalStart && windowStart < intervalEnd) {
        const clampedStart = windowStart < intervalStart ? new Date(intervalStart) : windowStart;
        const clampedEnd = windowEnd > intervalEnd ? new Date(intervalEnd) : windowEnd;
        if (clampedStart < clampedEnd) {
          windows.push({ start: clampedStart, end: clampedEnd });
        }
      }
    }
    // Move to the next day.
    current.setDate(current.getDate() + 1);
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
    segmentStart.getTime() + weight * (segmentEnd.getTime() - segmentStart.getTime())
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

// For a given segment and set of merged schedule windows, returns the overlapping
// interval (if any) in which a notification can be scheduled.
const getSegmentOverlap = (
  segment: Segment,
  mergedWindows: { start: Date; end: Date }[]
): { start: Date; end: Date } | null => {
  const overlaps: { start: Date; end: Date }[] = [];
  mergedWindows.forEach((window) => {
    // Compute the intersection between the segment and the window.
    const overlapStart = new Date(Math.max(segment.start.getTime(), window.start.getTime()));
    const overlapEnd = new Date(Math.min(segment.end.getTime(), window.end.getTime()));
    if (overlapStart < overlapEnd) {
      overlaps.push({ start: overlapStart, end: overlapEnd });
    }
  });
  if (overlaps.length === 0) return null;
  // For simplicity, choose the overlap interval with the longest duration.
  let longest = overlaps[0];
  let longestDuration = overlaps[0].end.getTime() - overlaps[0].start.getTime();
  overlaps.forEach((o) => {
    const dur = o.end.getTime() - o.start.getTime();
    if (dur > longestDuration) {
      longest = o;
      longestDuration = dur;
    }
  });
  return longest;
};

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
  const { start: localIntervalStart, end: localIntervalEnd } = calculateCurrentInterval(reminder, intervalIndex);
  console.log("Start:", localIntervalStart.toLocaleString());
  console.log("End:", localIntervalEnd.toLocaleString());

  // Get allowed schedule windows for the entire interval from all schedules.
  let allowedWindows: { start: Date; end: Date }[] = [];
  schedules.forEach((schedule) => {
    allowedWindows = allowedWindows.concat(
      getScheduleWindowsWithinInterval(schedule, localIntervalStart, localIntervalEnd)
    );
  });

  // Merge overlapping windows
  const mergedWindows = mergeTimeWindows(allowedWindows);

  // Calculate total allowed minutes from mergedWindows
  let totalAllowedMinutes = 0;
  mergedWindows.forEach((window) => {
    const durationMinutes = Math.floor((window.end.getTime() - window.start.getTime()) / (60 * 1000));
    totalAllowedMinutes += durationMinutes;
  });

  if (totalAllowedMinutes === 0) {
    console.log('No allowed minutes available in merged windows.');
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
    const exponent = bias === 0.5 ? 1 : (bias < 0.5 ? 1 + (0.5 - bias) * 2 : 1 / (1 + (bias - 0.5) * 2));
    const weight = Math.pow(u, exponent);
    const offsetInSegment = Math.floor(minOffset + weight * (maxOffset - minOffset));

    // Map the offset (in minutes) to an actual local time by traversing the mergedWindows
    let remainingOffset = offsetInSegment;
    let scheduledLocalTime: Date | null = null;

    for (let window of mergedWindows) {
      const windowDurationMinutes = Math.floor((window.end.getTime() - window.start.getTime()) / (60 * 1000));
      if (remainingOffset < windowDurationMinutes) {
        // Found the window where the offset falls
        scheduledLocalTime = new Date(window.start.getTime() + remainingOffset * 60 * 1000);
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
        segment_index: segmentIndex
      });
    } else {
      console.log(`Failed to map offset ${offsetInSegment} for segment ${segmentIndex}`);
    }
  }

  return notifications;
};

//------------------------------------------------------------------------------
// # Module 7: Persist Notifications
//------------------------------------------------------------------------------

// Loops over the generated notifications and persists each notification.
// The first notification (segment_index === 0) is flagged as isScheduled.
export const createNotifications = async (reminder: any, notifications: NotificationTime[]): Promise<void> => {
  for (const notif of notifications) {
    await db_source.createNotification(
      reminder.id,
      dayjs(notif.scheduled_at).format('YYYY-MM-DD HH:mm'),
      notif.segment_index === 0, // Only the first notification in an interval is marked as scheduled.
      notif.interval_index,
      notif.segment_index
    );
  }
};