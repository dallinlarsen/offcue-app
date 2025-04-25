export type InsertSchedule = {
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

export type Schedule = InsertSchedule & {
  id: number;
};
