import dayjs from "dayjs";
import * as notificationsService from "@/lib/notifications/notifications.service";
import * as notificationsSource from "@/lib/notifications/notifications.source";
import * as remindersService from "@/lib/reminders/reminders.service";
import * as schedulesService from "@/lib/schedules/schedules.service";

/** Test that ensureNotificationsForReminder skips notifications occurring before reminder.start_date. */
describe("generateFutureNotifications", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("skips notifications scheduled before the reminder start_date", async () => {
    const reminder = {
      id: 1,
      start_date: new Date("2026-01-01T00:00:00.000Z"),
      interval_type: "day",
      interval_num: 1,
      times: 1,
    } as any;

    jest
      .spyOn(notificationsSource, "getUnrespondedNotificationsByReminderId")
      .mockResolvedValue([]);
    jest.spyOn(remindersService, "getReminder").mockResolvedValue(reminder);
    jest.spyOn(schedulesService, "getSchedulesByReminderId").mockResolvedValue([
      {
        id: 1,
        created_at: "2025-01-01T01:00",
        updated_at: "2025-01-01T01:00",
        label: "Awake",
        is_sunday: true,
        is_monday: true,
        is_tuesday: true,
        is_wednesday: true,
        is_thursday: true,
        is_friday: true,
        is_saturday: true,
        is_active: true,
        start_time: "00:00",
        end_time: "23:99",
      },
    ]);

    const beforeStart = {
      scheduled_at: dayjs(reminder.start_date)
        .subtract(1, "hour")
        .toISOString(),
      interval_index: 0,
      segment_index: 0,
    };
    const afterStart = {
      scheduled_at: dayjs(reminder.start_date).add(1, "hour").toISOString(),
      interval_index: 1,
      segment_index: 0,
    };

    const genSpy = jest
      .spyOn(notificationsService, "generateNotificationTimes")
      .mockReturnValueOnce([beforeStart])
      .mockReturnValueOnce([afterStart]);
    const createSpy = jest
      .spyOn(notificationsService, "createNotifications")
      .mockResolvedValue();

    await notificationsService.ensureNotificationsForReminder(reminder.id, 1);

    expect(genSpy).toHaveBeenCalledTimes(2);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy.mock.calls[0][1]).toEqual([afterStart]);
  });
});
