import { InsertSchedule } from "@/lib/schedules/schedules.types";

export const FREQUENCY_TYPES = [
  { label: "Minute(s)", value: "minute" },
  { label: "Hour(s)", value: "hour" },
  { label: "Day(s)", value: "day" },
  { label: "Week(s)", value: "week" },
  { label: "Month(s)", value: "month" },
  { label: "Year(s)", value: "year" },
] as const;

export const DAYS = [
  { label: "Su", value: "sunday" },
  { label: "M", value: "monday" },
  { label: "Tu", value: "tuesday" },
  { label: "W", value: "wednesday" },
  { label: "Th", value: "thursday" },
  { label: "F", value: "friday" },
  { label: "Sa", value: "saturday" },
] as const;

export const STATUS_COLOR_MAP = {
  done: "success",
  no_response: undefined,
  skip: "info",
  later: "info",
} as const;

export const NO_REMINDERS_DUE_TEXT = [
  "Nothing's Due—You're Doing Great! 👍",
  "No Reminders. Just Vibes. 😎",
  "You're All Caught Up! 🎉",
  "You're Good to Go. 👍",
  "Your Brain Called—You're Free. 🧠",
  "Stillness is Progress. 🧘",
  "Rest is Part of the Routine. 🌱",
  "The Queue is Clear. 💪🏼",
  "Mission: Completed. 🚀",
  "Enjoy the downtime. 💤",
  "You're on break. 🍩",
  "Inbox: Zero. 📧",
  "Pause and appreciate. 🙏",
  "Let yourself recharge. 🔋",
  "Room to breathe. 💨",
  "Balance: Restored. 🧘‍♀️",
  "The day is yours. 🫵",
  "No loose ends. 👌",
] as const;

export const REMINDER_LIMIT = {
  task: 1,
  recurring: 2
} as const;