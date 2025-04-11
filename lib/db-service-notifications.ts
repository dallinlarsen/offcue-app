import * as db_source from './db-source';
// import { getReminderSchedules } from "./db-service";

/////////////////////////////////////////////
////////// CRUD for notifications //////////
///////////////////////////////////////////

//Create
export const createNotification = async (reminderId: number,
    scheduledAt: string,
    isScheduled: boolean,
    intervalIndex: number,
    segmentIndex: number) => {
    const result = await db_source.createNotification(reminderId, scheduledAt, isScheduled, intervalIndex, segmentIndex);
    return result;
};

//Read
export const getNotification = async (id: number) => {
    const notification = await db_source.getNotification(id);
    return notification;
};

//Update
export const updateNotification = async (id: number,
    scheduledAt: string,
    isScheduled: boolean,
    intervalIndex: number,
    segmentIndex: number,
    responseAt: string | null,
    responseStatus: string | null) => {
    const result = await db_source.updateNotification(id, scheduledAt, isScheduled, intervalIndex, segmentIndex, responseAt, responseStatus);
    return result;
};

//Delete
export const deleteNotification = async (id: number) => {
    const result = await db_source.deleteNotification(id);
    return result;
};

/////////////////////////////////////////
////////// Notification Logic //////////
///////////////////////////////////////

export const handleReminderNotifications = async (reminderId: number): Promise<void> => {
    try {
        console.log("Starting step 1...");
        // 1. Fetch the reminder record
        const reminders = await db_source.getAllReminders();
        const reminder = reminders.find((r: any) => r.id === reminderId);
        if (!reminder) {
            console.error(`Reminder with id ${reminderId} not found.`);
            return;
        }
        console.log("Reminder fetched:", reminder);

        console.log('Starting step 2...');
        // 2. Determine the current interval index
        // Use the next unscheduled notification if available; otherwise, default to interval index 0.
        const nextNotification = await db_source.getNextNotification(reminderId);
        const currentIntervalIndex = nextNotification ? nextNotification.interval_index : 0;
        console.log("Current interval index:", currentIntervalIndex);

        console.log('Starting step 3...');
        // 3. Fetch all notifications for the current interval
        const notificationsForCurrentInterval = await db_source.getNotificationsByInterval(reminderId, currentIntervalIndex);
        // Check if all notifications in the current interval have been resolved (i.e. response_at is not null)
        const allResolved = notificationsForCurrentInterval.every((n: any) => n.response_at !== null);
        console.log("All notifications resolved:", allResolved);

        if (!allResolved) {
            console.log("Not all notifications for the current interval are resolved. No new notifications will be created.");
            return;
        }

        console.log('Starting step 4...');
        // 4. Retrieve schedules for the reminder (if any)
        const schedules = await db_source.getReminderSchedules(reminderId);
        console.log("Schedules for reminder:", schedules);

        console.log('Starting step 5...');
        // 5. Calculate new notification times for the next interval (currentIntervalIndex + 1)
        let newNotifications;
        if (schedules && schedules.length > 0) {
            console.log("Schedules exist, generating notification times based on schedules...");
            // If schedules exist, use the schedule-based generator
            newNotifications = generateNotificationTimes(reminder, schedules, currentIntervalIndex + 1);
        } else {
            console.log("No schedules found, using fallback logic...");
            // No schedules: fall back to the simpler evenly-spaced notifications
            // createNotificationsForInterval calls calculateScheduledTime internally.
            await createNotificationsForInterval(reminder, currentIntervalIndex + 1);
            console.log(`Notifications for interval ${currentIntervalIndex + 1} created using fallback logic.`);
            return;
        }

        console.log('Starting step 6...');
        // 6. Create notifications in the database from the generated notification times
        for (const notif of newNotifications) {
            // Here, we set isScheduled to true for the first notification (segment_index 0)
            await createNotification(
                reminder.id,
                notif.scheduled_at,
                notif.segment_index === 0,
                notif.interval_index,
                notif.segment_index
            );
        }

        console.log(`Notifications for interval ${currentIntervalIndex + 1} have been created.`);

    } catch (error) {
        console.error("Error in refreshReminderNotifications:", error);
        throw error;
    }
};

export const generateNotificationTimes = (
    reminder: any,
    schedules: any[],
    currentIntervalIndex: number
): { scheduled_at: string, interval_index: number, segment_index: number }[] => {
    // 1. Calculate overall interval boundaries
    const intervalStart = new Date(reminder.created_at);
    const intervalEnd = calculateIntervalEnd(intervalStart, reminder.interval_type, reminder.interval_num);

    // 2. Determine allowed time windows from all schedules
    let allowedWindows: { start: Date, end: Date }[] = [];
    for (const schedule of schedules) {
        const windows = getScheduleWindowsWithinInterval(schedule, intervalStart, intervalEnd);
        allowedWindows = allowedWindows.concat(windows);
    }

    console.log('allowedWindows', allowedWindows);
    // 3. Merge overlapping allowed windows
    const mergedWindows = mergeTimeWindows(allowedWindows);
    console.log('mergedWindows', mergedWindows)

    // 4. Calculate total allowed duration (in milliseconds)
    let totalAllowedDuration = 0;
    for (const window of mergedWindows) {
        totalAllowedDuration += window.end.getTime() - window.start.getTime();
    }

    // 5. Determine duration per notification segment
    const segmentDuration = totalAllowedDuration / reminder.times;

    // 6. Create notifications by splitting the allowed time into segments and picking a random time within each
    const notifications: { scheduled_at: string, interval_index: number, segment_index: number }[] = [];
    for (let segmentIndex = 0; segmentIndex < reminder.times; segmentIndex++) {
        const segmentStartOffset = segmentIndex * segmentDuration;
        const segmentEndOffset = (segmentIndex + 1) * segmentDuration;
        const segmentStartTime = getTimeAtTotalOffset(mergedWindows, segmentStartOffset);
        const segmentEndTime = getTimeAtTotalOffset(mergedWindows, segmentEndOffset);
        const randomTime = getRandomTime(segmentStartTime, segmentEndTime);
        notifications.push({
            scheduled_at: randomTime.toISOString(),
            interval_index: currentIntervalIndex,
            segment_index: segmentIndex
        });
    }
    return notifications;
};

// Helper function to create notifications for a specific interval
export const createNotificationsForInterval = async (reminder: any, intervalIndex: number): Promise<void> => {
    for (let segmentIndex = 0; segmentIndex < reminder.times; segmentIndex++) {
        const scheduledAt = calculateScheduledTime(reminder, intervalIndex, segmentIndex);
        // Only the first notification in the interval is marked as scheduled
        await createNotification(reminder.id, scheduledAt, segmentIndex === 0, intervalIndex, segmentIndex);
    }
};

export const calculateIntervalEnd = (startDate: Date, intervalType: string, intervalNum: number): Date => {
    const endDate = new Date(startDate);
    switch (intervalType) {
        case 'minute':
            endDate.setMinutes(endDate.getMinutes() + intervalNum);
            break;
        case 'hour':
            endDate.setHours(endDate.getHours() + intervalNum);
            break;
        case 'day':
            endDate.setDate(endDate.getDate() + intervalNum);
            break;
        case 'week':
            endDate.setDate(endDate.getDate() + intervalNum * 7);
            break;
        case 'month':
            endDate.setMonth(endDate.getMonth() + intervalNum);
            break;
        case 'year':
            endDate.setFullYear(endDate.getFullYear() + intervalNum);
            break;
        default:
            break;
    }
    return endDate;
};

export const getScheduleWindowsWithinInterval = (schedule: any, intervalStart: Date, intervalEnd: Date): { start: Date, end: Date }[] => {
    const windows: { start: Date, end: Date }[] = [];
    const current = new Date(intervalStart);
    while (current <= intervalEnd) {
        const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
        let applies = false;
        switch (dayOfWeek) {
            case 0: applies = schedule.is_sunday === 1; break;
            case 1: applies = schedule.is_monday === 1; break;
            case 2: applies = schedule.is_tuesday === 1; break;
            case 3: applies = schedule.is_wednesday === 1; break;
            case 4: applies = schedule.is_thursday === 1; break;
            case 5: applies = schedule.is_friday === 1; break;
            case 6: applies = schedule.is_saturday === 1; break;
        }
        if (applies) {
            // Combine the current date with the schedule's start and end times (assumed format: "HH:MM")
            const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
            const [endHour, endMinute] = schedule.end_time.split(':').map(Number);
            const windowStart = new Date(current);
            windowStart.setHours(startHour, startMinute, 0, 0);
            const windowEnd = new Date(current);
            windowEnd.setHours(endHour, endMinute, 0, 0);
            // Adjust the window if it falls outside the interval boundaries
            if (windowEnd > intervalStart && windowStart < intervalEnd) {
                const clampedStart = windowStart < intervalStart ? new Date(intervalStart) : windowStart;
                const clampedEnd = windowEnd > intervalEnd ? new Date(intervalEnd) : windowEnd;
                if (clampedStart < clampedEnd) {
                    windows.push({ start: clampedStart, end: clampedEnd });
                }
            }
        }
        // Move to the next day
        current.setDate(current.getDate() + 1);
    }
    return windows;
};

export const mergeTimeWindows = (windows: { start: Date, end: Date }[]): { start: Date, end: Date }[] => {
    if (windows.length === 0) return [];
    // Sort windows by start time
    windows.sort((a, b) => a.start.getTime() - b.start.getTime());
    const merged = [windows[0]];
    for (let i = 1; i < windows.length; i++) {
        const last = merged[merged.length - 1];
        const current = windows[i];
        if (current.start.getTime() <= last.end.getTime()) { // overlapping
            last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
        } else {
            merged.push(current);
        }
    }
    return merged;
};

export const getTimeAtTotalOffset = (mergedWindows: { start: Date, end: Date }[], offset: number): Date => {
    for (const window of mergedWindows) {
        const duration = window.end.getTime() - window.start.getTime();
        if (offset < duration) {
            return new Date(window.start.getTime() + offset);
        }
        offset -= duration;
    }
    // If offset exceeds total duration, return end of last window
    return mergedWindows[mergedWindows.length - 1].end;
};

export const getRandomTime = (startTime: Date, endTime: Date): Date => {
    const diff = endTime.getTime() - startTime.getTime();
    const randomOffset = Math.random() * diff;
    return new Date(startTime.getTime() + randomOffset);
};

export const calculateScheduledTime = (reminder: any, intervalIndex: number, segmentIndex: number): string => {
    const startDate = new Date(reminder.created_at);
    let intervalStartDate = new Date(startDate);
    switch (reminder.interval_type) {
        case 'minute':
            intervalStartDate.setMinutes(intervalStartDate.getMinutes() + reminder.interval_num * intervalIndex);
            break;
        case 'hour':
            intervalStartDate.setHours(intervalStartDate.getHours() + reminder.interval_num * intervalIndex);
            break;
        case 'day':
            intervalStartDate.setDate(intervalStartDate.getDate() + reminder.interval_num * intervalIndex);
            break;
        case 'week':
            intervalStartDate.setDate(intervalStartDate.getDate() + reminder.interval_num * 7 * intervalIndex);
            break;
        case 'month':
            intervalStartDate.setMonth(intervalStartDate.getMonth() + reminder.interval_num * intervalIndex);
            break;
        case 'year':
            intervalStartDate.setFullYear(intervalStartDate.getFullYear() + reminder.interval_num * intervalIndex);
            break;
        default:
            break;
    }
    let intervalDurationMs;
    switch (reminder.interval_type) {
        case 'minute':
            intervalDurationMs = reminder.interval_num * 60 * 1000;
            break;
        case 'hour':
            intervalDurationMs = reminder.interval_num * 60 * 60 * 1000;
            break;
        case 'day':
            intervalDurationMs = reminder.interval_num * 24 * 60 * 60 * 1000;
            break;
        case 'week':
            intervalDurationMs = reminder.interval_num * 7 * 24 * 60 * 60 * 1000;
            break;
        case 'month':
            intervalDurationMs = reminder.interval_num * 30 * 24 * 60 * 60 * 1000; // Approximation
            break;
        case 'year':
            intervalDurationMs = reminder.interval_num * 365 * 24 * 60 * 60 * 1000;
            break;
        default:
            intervalDurationMs = 0;
            break;
    }
    const segmentDurationMs = intervalDurationMs / reminder.times;
    const scheduledTime = new Date(intervalStartDate.getTime() + segmentDurationMs * segmentIndex);
    return scheduledTime.toISOString();
};


// Function to process the current interval for a reminder
export const processCurrentInterval = async (reminderId: number): Promise<void> => {
    try {
        // Fetch the next unscheduled notification
        const nextNotification = await db_source.getNextNotification(reminderId);

        // Determine current interval index; if there is a next notification, use its interval_index,
        // otherwise, assume the last created interval. (You may adjust this logic as needed.)
        const currentIntervalIndex = nextNotification ? nextNotification.interval_index : 0;

        // Fetch all notifications for the current interval.
        const notificationsForCurrentInterval = await db_source.getNotificationsByInterval(reminderId, currentIntervalIndex);

        // Check if all notifications in the current interval are resolved (i.e., response_at is not null)
        const allResolved = notificationsForCurrentInterval.every((n: any) => n.response_at !== null);

        if (allResolved) {
            // Retrieve reminder data (assume you have a reminder object)
            const reminder = await db_source.getReminder(reminderId);

            if (!reminder) {
                console.error('Reminder not found');
                return;
            }

            // Create notifications for the next interval
            const nextIntervalIndex = currentIntervalIndex + 1;
            await createNotificationsForInterval(reminder, nextIntervalIndex);
        } else {
            console.log('Current interval is not yet complete. Waiting for all notifications to be resolved.');
        }
    } catch (error) {
        console.error('Error processing the current interval:', error);
    }
};

// Helper function to schedule the next notification for a reminder
export const scheduleNextNotification = async (reminderId: number): Promise<void> => {
    const nextNotification = await db_source.getNextNotification(reminderId);
    if (nextNotification) {
        await updateNotification(
            nextNotification.id,
            nextNotification.scheduled_at,
            true, // Set isScheduled to true
            nextNotification.interval_index,
            nextNotification.segment_index,
            null, // response_at
            null  // response_status
        );
        console.log("✅ Next notification scheduled", nextNotification.id);
    }
};