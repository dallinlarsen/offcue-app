import SettingDropDown from "./SettingDropDown";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useWatch from "@/hooks/useWatch";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "../ui/select";
import { ChevronDownIcon } from "../ui/icon";
import { useSettings } from "@/hooks/useSettings";
import { useEffect, useState } from "react";
import { $reloadSettings, $settings } from "@/lib/settings/settings.store";
import { useStore } from "@nanostores/react";

type Props = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

const ZodSchema = z.object({
  theme: z.literal("light").or(z.literal("dark")).or(z.literal("system")),
});

const SELECT_OPTIONS = [
  { label: "🖥️ System", value: "system" },
  { label: "☀️ Light", value: "light" },
  { label: "🌙 Dark", value: "dark" },
];

export default function ({ open, setOpen }: Props) {
  const { updateSettings } = useSettings();
  const settings = useStore($settings);
  const [fieldKey, setFieldKey] = useState(1);

  const { watch, control, setValue } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      theme: settings.theme,
    },
  });

  useWatch(settings.theme, (val) => {
    setValue("theme", val);
    setFieldKey(fieldKey + 1);
  });

  const themeValue = watch("theme");

  useWatch(themeValue, async (newVal, oldVal) => {
    if (newVal !== oldVal) { 
      await updateSettings({ theme: newVal });
      $reloadSettings.set(true);
    }
  });

  return (
    <SettingDropDown title="App Theme" open={open} setOpen={setOpen}>
      <Controller
        key={fieldKey}
        control={control}
        name="theme"
        render={({ field: { onChange, onBlur, value } }) => (
          <Select
            selectedValue={value}
            onValueChange={onChange}
            initialLabel={
              SELECT_OPTIONS.find((o) => themeValue === o.value)?.label
            }
          >
            <SelectTrigger
              variant="outline"
              size="xl"
              className="flex justify-between"
            >
              <SelectInput placeholder="Select Option" onBlur={onBlur} />
              <SelectIcon className="mr-3" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {SELECT_OPTIONS.map((t) => (
                  <SelectItem key={t.value} label={t.label} value={t.value} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        )}
      />
    </SettingDropDown>
  );
}
