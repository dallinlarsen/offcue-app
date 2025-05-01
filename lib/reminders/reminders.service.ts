import { deleteNotesByReminderId } from "../notes/notes.source";
import {
  createInitialNotifications,
  deleteFutureNotificationsByReminderId,
  deleteNotificationsByReminderId,
  recalcFutureNotifications,
} from "../notifications/notifications.service";
import {
  createScheduleReminderMaps,
  deleteReminderScheduleMapByReminderId,
  deleteReminderScheduleMapByReminderIdAndScheduleId,
  getSchedulesByReminderId,
} from "../schedules/schedules.service";
import * as source from "./reminders.source";
import {
  InsertReminder,
  ReminderBase,
  ReminderBooleanColumn,
} from "./reminders.types";
import omit from "lodash/omit";

export { remindersInit } from "./reminders.source";

export async function getReminder(id: number) {
  return (await source.getReminderOrGetReminders(id))[0];
}

export async function getReminders(
  limit?: number,
  offset?: number,
  wherePositive: ReminderBooleanColumn[] = [],
  whereNegative: ReminderBooleanColumn[] = [],
  orderByScheduledAt: "ASC" | "DESC" = "ASC"
) {
  return await source.getReminderOrGetReminders(
    undefined,
    limit,
    offset,
    wherePositive,
    whereNegative,
    orderByScheduledAt,
  );
}

export async function createReminder(
  model: InsertReminder & { scheduleIds: number[] }
) {
  const insertModel = omit(model, ["scheduleIds"]);
  const reminderId = await source.createReminder(insertModel);

  await createScheduleReminderMaps(reminderId, model.scheduleIds);
  await createInitialNotifications(reminderId);

  return reminderId;
}

export async function updateReminder(
  model: Partial<ReminderBase> & { scheduleIds: number[] }
) {
  const updateModel = omit(model, ["scheduleIds"]);
  await source.updateReminder(model.id!, updateModel);

  const currentSchedules = await getSchedulesByReminderId(model.id!);
  const currentScheduleIds = currentSchedules.map((s) => s.id);
  const schedulesToRemove = currentScheduleIds.filter(
    (s) => !model.scheduleIds.includes(s)
  );
  const schedulesToAdd = model.scheduleIds.filter(
    (s) => !currentScheduleIds.includes(s)
  );

  for (const schedule_id of schedulesToRemove) {
    await deleteReminderScheduleMapByReminderIdAndScheduleId(
      model.id!,
      schedule_id
    );
  }

  await createScheduleReminderMaps(model.id!, schedulesToAdd);
  await recalcFutureNotifications(model.id!);
}

export const updateReminderMuted = async (id: number, isMuted: boolean) => {
  await source.updateReminder(id, { is_muted: isMuted });
  if (isMuted) {
    await deleteFutureNotificationsByReminderId(id);
  } else {
    await recalcFutureNotifications(id);
  }
};

export const updateReminderArchived = async (
  id: number,
  isArchived: boolean
) => {
  await source.updateReminder(id, {
    is_archived: isArchived,
    is_muted: isArchived,
  });
  if (isArchived) {
    await deleteFutureNotificationsByReminderId(id);
  } else {
    // TODO: When future notification generation is implemented call it here.
    await recalcFutureNotifications(id);
  }
};

export const deleteReminder = async (id: number) => {
  await deleteNotesByReminderId(id);
  await deleteNotificationsByReminderId(id);
  await deleteReminderScheduleMapByReminderId(id);
  await source.deleteReminder(id);
};
