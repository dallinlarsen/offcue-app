import * as db_source from './db-source';
import { processReminderNotifications } from './db-service-notifications';
import { scheduleAllUpcomingNotifications } from './device-notifications.service';

// App Loop Function
export async function appLoop() {
    await processArchiveReminders();
    await processEnsureRemindersHaveNotifications();
    await processEnsureNotifications();
}

// Process that archives tasks based on the end date. 
export async function processArchiveReminders() {
    // Get all reminders whose end date is in the past
    let reminders = await db_source.getReminderIDsWhoHaveEnded();

    // Delete all the notifications for those reminders that are in the future
    for (const reminder of reminders) {
        const futureNotifications = await db_source.getFutureNotificationsForReminder(reminder.id);
        for (const notification of futureNotifications) {
            await db_source.deleteNotification(notification.id);
        }
        // Archive the reminder
        await db_source.updateReminderArchived(reminder.id, true);
    }
}

// Process that ensures all active reminders have at least 10 notifications in the future
export async function processEnsureRemindersHaveNotifications() {
    // Get all active reminders
    let reminders = await db_source.getActiveReminders();

    // For each reminder, check if it has at least 10 notifications in the future
    for (const reminder of reminders) {
        const futureNotifications = await db_source.getFutureNotificationsForReminder(reminder.id);
        if (futureNotifications.length < 10) {
            // Create new notifications
            await processReminderNotifications(reminder.id);
        }
    }
}

// Process that ensures the notification system has the 64 nearest notifications
export async function processEnsureNotifications() {
    await scheduleAllUpcomingNotifications();
}