import colors from "tailwindcss/colors";
import { HStack } from "../ui/hstack";
import { Switch } from "../ui/switch";
import { Text } from "../ui/text";
import SettingDropDown from "./SettingDropDown";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setNavFilter } from "@/lib/db-source";
import useWatch from "@/hooks/useWatch";

type Props = {
  navState: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

const ZodSchema = z.object({
  filter_reminder_nav: z.boolean(),
});

export default function ({ open, setOpen, navState }: Props) {
  const { watch, setValue } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      filter_reminder_nav: navState,
    },
  });

  const filter_reminder_nav = watch("filter_reminder_nav");

  useWatch(filter_reminder_nav, async (newVal, oldVal) => {
    if (newVal !== oldVal) await setNavFilter(newVal);
  });

  return (
    <SettingDropDown title="Filter Navigation" open={open} setOpen={setOpen}>
      <HStack space="xl" className="items-center ">
        <Text size="xl" className="font-quicksand-semibold">
          Use Filter Navigation
        </Text>
        <Switch
          value={filter_reminder_nav}
          onValueChange={(value) => setValue("filter_reminder_nav", value)}
          trackColor={{
            false: colors.gray[300],
            true: colors.gray[500],
          }}
          thumbColor={colors.gray[50]}
          ios_backgroundColor={colors.gray[300]}
        />
      </HStack>
    </SettingDropDown>
  );
}
