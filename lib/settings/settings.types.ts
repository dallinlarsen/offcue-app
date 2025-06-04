export type Settings = {
  id: number;
  has_completed_tutorial: boolean;
  notification_sound: string | null;
  notification_vibration: boolean;
  theme: ThemeOption;
  language: string;
  timezone: string;
};

export type ThemeOption = "light" | "dark" | "system";
