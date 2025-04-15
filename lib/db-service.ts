import * as db_source from './db-source';
import { createInitialNotifications } from './db-service-notifications';

export { getScheduleReminders, getReminderPastNotifications, updateNotificationResponse } from "./db-source";
export { processReminderNotifications, recalcFutureNotifications } from "./db-service-notifications";

export const createDatabase = async () => {
    db_source.initDatabase();
};

/////////////////////////////////////////
////////// CRUD for reminders //////////
///////////////////////////////////////

//Create
export const createReminder = async (title: string,
    description: string,
    intervalType: string,
    intervalNum: number,
    times: number,
    scheduleIds: number[],
    trackStreak: boolean,
    trackNotes: boolean,
    muted: boolean) => {
    const result = await db_source.createReminder(title, description, intervalType, intervalNum, times, scheduleIds, trackStreak, trackNotes, muted);

    // Create notifications for the reminder
    createInitialNotifications(result);

    return result;
};

//Read
export const getReminder = async (id: number) => {
    const reminder = await db_source.getReminder(id);
    return reminder;
};

//Update
export const updateReminder = async (id: number,
    title: string,
    description: string,
    intervalType: string,
    intervalNum: number,
    times: number,
    scheduleIds: number[],
    trackStreak: boolean,
    trackNotes: boolean,
    isMuted: boolean) => {
    const result = await db_source.updateReminder(id, title, description, intervalType, intervalNum, times, scheduleIds, trackStreak, trackNotes, isMuted);
    return result;
};

//Update Muted
export const updateReminderMuted = async (id: number, isMuted: boolean) => {
    const result = await db_source.updateReminderMuted(id, isMuted);
    return result;
};

//Delete
export const deleteReminder = async (id: number) => {
    const result = await db_source.deleteReminder(id);
    return result;
};

/////////////////////////////////////
////////// CRUD for Notes //////////
///////////////////////////////////

// TODO: Will implement notes later
// It is not in our MVP

/////////////////////////////////////////
////////// CRUD for schedules //////////
///////////////////////////////////////

//Create
export const createSchedule = async (label: string,
    isSunday: boolean,
    isMonday: boolean,
    isTuesday: boolean,
    isWednesday: boolean,
    isThursday: boolean,
    isFriday: boolean,
    isSaturday: boolean,
    startTime: string,
    endTime: string) => {
    const result = await db_source.createSchedule(label, isSunday, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, startTime, endTime);
    return result;
};

//Read
export const getSchedule = async (id: number) => {
    const schedule = await db_source.getSchedule(id);
    return schedule;
};

//Update
export const updateSchedule = async (id: number,
    label: string,
    isSunday: boolean,
    isMonday: boolean,
    isTuesday: boolean,
    isWednesday: boolean,
    isThursday: boolean,
    isFriday: boolean,
    isSaturday: boolean,
    startTime: string,
    endTime: string) => {
    const result = await db_source.updateSchedule(id, label, isSunday, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, startTime, endTime);
    return result;
};

//Delete
export const deleteSchedule = async (id: number) => {
    const result = await db_source.deleteSchedule(id);
    return result;
};

///////////////////////////////////////
////////// Get All Entities //////////
/////////////////////////////////////

// Get All Reminders
export const getAllReminders = async () => {
    const notifications = await db_source.getAllReminders();
    return notifications;
};

// Get All Notifications for a Reminder
export const getAllSchedules = async () => {
    const notifications = await db_source.getAllSchedules();
    return notifications;
};

////////////////////////////////////////////////////
////////// Get All Entities For Reminder //////////
//////////////////////////////////////////////////

// Get All Notifications for a Reminder
export const getNotificationsForReminder = async (reminderId: number) => {
    const notifications = await db_source.getReminderNotifications(reminderId);
    return notifications;
};

// Get Open Notifications for a Reminder
export const getOpenNotificationsForReminder = async (reminderId: number) => {
    const notifications = await db_source.getUnrespondedReminderNotifications(reminderId);
    return notifications;
};


////////////////////////////////////////////
////////// Functions for testing //////////
//////////////////////////////////////////

// Function to wipe the database and reinitialize it
// This is useful for development purposes or when you want to reset the database
// There is a button on the home page that calls this function
export const wipeDatabase = async () => {
    db_source.wipeDatabase();
};

// Force the recreation of notifications
// First delete the existing notifications in the current interval index
// Then create new notifications
export const deleteNotificationsInInterval = async (reminderId: number): Promise<void> => {
    // Get the interval index of the reminder
    const currentNotification = await db_source.getUnrespondedReminderNotifications(reminderId);
    console.log("Current Notification: ", currentNotification);
    const currentIntervalIndex = currentNotification[0].interval_index;
    console.log("Current Interval Index: ", currentIntervalIndex);

    // Delete all notifications in the current interval index
    await db_source.deleteNotificationsInInterval(reminderId, currentIntervalIndex);
};