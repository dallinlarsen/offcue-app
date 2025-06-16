import { atom, deepMap } from "nanostores";
import { getSettings } from "./settings.source";
import { Settings } from "./settings.types";

export const $reloadSettings = atom(false);
export const $settings = deepMap<Settings>({
  has_completed_tutorial: true,
  id: 1,
  language: "EN",
  theme: "system",
  timezone: "UTC",
  notification_sound: null,
  notification_vibration: false,
});

$reloadSettings.listen(async (value) => {
  if (value) {
    $settings.set((await getSettings())!);
    $reloadSettings.set(false);
  }
});
