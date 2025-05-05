import { recalcFutureNotifications } from "../notifications/notifications.service";
import { getRemindersByScheduleId } from "../reminders/reminders.source";
import * as source from "./schedules.source";
import { InsertSchedule, Schedule } from "./schedules.types";

export {
  schedulesInit,
  getSchedulesByReminderId,
  createScheduleReminderMaps,
  deleteReminderScheduleMapByReminderId,
  deleteReminderScheduleMapByReminderIdAndScheduleId,
  createInitialSchedules,
  getSchedule,
  deleteSchedule,
  getAllSchedules,
} from "./schedules.source";

export async function updateSchedule(
  id: number,
  schedule: Partial<Schedule>,
  recalcNotifications: boolean = true
) {
  await source.updateSchedule(id, schedule);

  if (recalcNotifications) {
    async function updateReminders() {
      const reminders = await getRemindersByScheduleId(id);
      for (const reminder of reminders.filter(
        (r) => !r.is_muted && !r.is_archived && !r.is_completed
      )) {
        await recalcFutureNotifications(reminder.id);
      }
    }

    updateReminders();
  }
}

export async function createSchedule(schedule: InsertSchedule) {
  const existingScheduleId = await source.doesSameScheduleConfigurationExist(
    schedule
  );

  if (existingScheduleId) return existingScheduleId;

  return await source.createSchedule(schedule);
}
