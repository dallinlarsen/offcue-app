import dayjs from "dayjs";
import { IntervalType } from "../reminders/reminders.types";
import { InsertSchedule } from "../schedules/schedules.types";

export function chunkIntoPairs<T>(list: T[]) {
  const result = [];

  for (let i = 0; i < list.length; i += 2) {
    const first = list[i];
    const second = list[i + 1] !== undefined ? list[i + 1] : null;
    result.push([first, second]);
  }

  return result;
}

export function formatFrequencyString(
  times: number,
  interval_num: number,
  interval_type: IntervalType
) {
  return `${times === 1 ? "once" : `${times} times`} every ${
    interval_num === 1
      ? interval_type
      : `${interval_num} ${interval_type + "s"}`
  }`;
}

type DayList = Partial<typeof WEEK_DAYS>;

const WEEK_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const DAY_LABEL_MAP: Record<(typeof WEEK_DAYS)[number], string> = {
  sunday: "Su",
  monday: "M",
  tuesday: "Tu",
  wednesday: "W",
  thursday: "Th",
  friday: "F",
  saturday: "Sa",
} as const;

export const ALL_DAY_LABEL = "all day";

function formatTime(t: string) {
  const formatted = dayjs(`2000-01-01 ${t}`).format("h:mma");
  return formatted.replace(":00", "").toLowerCase();
}

/**
 * Compress a set of days (using a cyclic Monday-to-Sunday array) into a string.
 * For example, ['monday','wednesday','friday'] becomes "M, W, F"
 * and a wrap-around range such as ['friday','saturday','sunday','monday','tuesday']
 * becomes "F-Tu".
 */
function compressDays(days: DayList): string {
  const daySet = new Set(days.map((d) => d?.toLowerCase()));
  if (daySet.size === 0) return "";

  // Find segments in the week array where the day is selected.
  const segments: { start: number; end: number }[] = [];
  let i = 0;
  while (i < WEEK_DAYS.length) {
    if (daySet.has(WEEK_DAYS[i])) {
      const start = i;
      while (i < WEEK_DAYS.length && daySet.has(WEEK_DAYS[i])) {
        i++;
      }
      segments.push({ start, end: i - 1 });
    } else {
      i++;
    }
  }

  // Check for a wrap-around: if the first day (Monday) and the last day (Sunday)
  // are both selected then merge the first and last segments.
  if (segments.length > 1) {
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];
    if (firstSeg.start === 0 && lastSeg.end === WEEK_DAYS.length - 1) {
      // Merge the segments: the new range goes from the start of the last segment
      // to the end of the first segment.
      segments[0] = { start: lastSeg.start, end: firstSeg.end };
      segments.pop();
    }
  }

  // Format each segment.
  const formattedSegments = segments.map((seg) => {
    if (seg.start === seg.end) {
      return DAY_LABEL_MAP[WEEK_DAYS[seg.start]];
    } else {
      return `${DAY_LABEL_MAP[WEEK_DAYS[seg.start]]}-${
        DAY_LABEL_MAP[WEEK_DAYS[seg.end]]
      }`;
    }
  });

  return formattedSegments.join(", ");
}

export function formatScheduleString(schedule: InsertSchedule) {
  const days = [
    schedule.is_sunday && "sunday",
    schedule.is_monday && "monday",
    schedule.is_tuesday && "tuesday",
    schedule.is_wednesday && "wednesday",
    schedule.is_thursday && "thursday",
    schedule.is_friday && "friday",
    schedule.is_saturday && "saturday",
  ].filter((d) => !!d) as unknown as DayList;

  // Create a set of all days for checking if every day is included.
  const inputSet = new Set(days.map((d) => d?.toLowerCase()));

  let timeString = `${formatTime(schedule.start_time)} - ${formatTime(
    schedule.end_time
  )}`;

  if (schedule.start_time === schedule.end_time) timeString = ALL_DAY_LABEL;

  // If every day of the week is selected, return only the time string.
  if (WEEK_DAYS.every((d) => inputSet.has(d))) {
    return timeString;
  }

  const daysString = compressDays(days);
  return `${daysString} ${timeString}`;
}
