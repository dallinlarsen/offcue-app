export type InsertRNotification = {
  reminder_id: number;
  scheduled_at: string;
  interval_index: number;
  segment_index: number;
};

export type RNotification = InsertRNotification & {
  id: number;
  response_at: string | null;
  response_status: NotificationResponseStatus | null;
  created_at: string;
  updated_at: string;
};

export type NotificationResponseStatus =
  | "done"
  | "skip"
  | "no_response"
  | "later";