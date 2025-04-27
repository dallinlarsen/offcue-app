import { Schedule } from "../schedules/schedules.types";

export type NReminder = {
  title: string;
  description?: string;
  interval_type: IntervalType;
  interval_num: number;
  times: number;
  is_recurring: boolean;
};

export type ReminderBase = NReminder & {
  id: number;
  track_streak: boolean;
  track_notes: boolean;
  is_muted: boolean;
  is_completed: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string;
  start_date: string;
  end_date: string | null;
};

export type Reminder = ReminderBase & {
  schedules: Schedule[];
  due_scheduled_at: string | null;
  due_notification_id: number | null;
  current_streak?: number;
};

export type InsertReminder = {
  title: string;
  description?: string;
  interval_type: IntervalType;
  interval_num: number;
  times: number;
  is_recurring: boolean;
  track_streak: boolean;
  track_notes: boolean;
  start_date: string;
  end_date: string | null;
};

export type IntervalType =
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export type ReminderBooleanColumn =
  | "track_streak"
  | "track_notes"
  | "is_recurring"
  | "is_muted"
  | "is_completed"
  | "is_archived";
