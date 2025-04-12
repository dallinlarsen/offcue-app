export type Reminder = {
  id?: number;
  title: string;
  description?: string;
  interval_type: IntervalType;
  interval_num: number;
  times: number;
  schedules: Schedule[];
  track_streak: boolean;
  track_notes: boolean;
  is_muted: boolean;
  created_at: Date;
};

export type Schedule = {
  id: number;
  label: string;
  is_sunday: boolean;
  is_monday: boolean;
  is_tuesday: boolean;
  is_wednesday: boolean;
  is_thursday: boolean;
  is_friday: boolean;
  is_saturday: boolean;
  start_time: string;
  end_time: string;
};

export type IntervalType = "minute" | "hour" | "day" | "week" | "month" | "year";
