export const FREQUENCY_TYPES = [
  { label: "Minute(s)", value: "minute" },
  { label: "Hour(s)", value: "hour" },
  { label: "Day(s)", value: "day" },
  { label: "Week(s)", value: "week" },
  { label: "Month(s)", value: "month" },
  { label: "Year(s)", value: "year" },
];

export const DAYS = [
  { label: "Su", value: "sunday" },
  { label: "M", value: "monday" },
  { label: "Tu", value: "tuesday" },
  { label: "W", value: "wednesday" },
  { label: "Th", value: "thursday" },
  { label: "F", value: "friday" },
  { label: "Sa", value: "saturday" },
];

export const STATUS_COLOR_MAP = {
  done: "success",
  missed: "warning",
  skip: "info",
} as const;
