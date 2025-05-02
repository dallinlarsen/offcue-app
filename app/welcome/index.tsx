import { ThemedContainer } from "@/components/ThemedContainer";
import AdvancedSettings5 from "@/components/welcome/AdvancedSettings5";
import Confirm6 from "@/components/welcome/Confirm6";
import Frequency3 from "@/components/welcome/Frequency3";
import Notes2 from "@/components/welcome/Notes2";
import ReminderIntro1 from "@/components/welcome/ReminderIntro1";
import Schedules4 from "@/components/welcome/Schedules4";
import Welcome0 from "@/components/welcome/Welcome0";
import { useConfetti } from "@/hooks/useConfetti";
import useWatch from "@/hooks/useWatch";
import { createReminder } from "@/lib/reminders/reminders.service";
import {
  InsertReminder,
  InsertReminderModel,
} from "@/lib/reminders/reminders.types";
import { createSchedule } from "@/lib/schedules/schedules.service";
import { Schedule } from "@/lib/schedules/schedules.types";
import { updateSettings } from "@/lib/settings/settings.source";
import { useRouter } from "expo-router";
import omit from "lodash/omit";
import { useState } from "react";

export default function () {
  const router = useRouter();
  const confetti = useConfetti();

  const [pageState, setPageState] = useState(0);
  const [builtReminder, setBuiltReminder] = useState<
    Partial<InsertReminderModel>
  >({});
  const [createdReminderId, setCreatedReminderId] = useState<number | null>(
    null
  );

  useWatch(pageState, (value) => {
    if (value >= 7) {
      updateSettings({ has_completed_tutorial: true });
      router.replace("/");
    }
  });

  function onNextHandler(page: number, reminder: Partial<InsertReminderModel>) {
    setBuiltReminder({ ...builtReminder, ...reminder });
    setPageState(page);
  }

  function sendConfetti() {
    confetti.current?.restart();
    setTimeout(() => confetti.current?.reset(), 9000);
  }

  async function completeReminder(reminder: Partial<InsertReminderModel>) {
    const scheduleIds: number[] = [];

    for (const schedule of reminder.schedules as Schedule[]) {
      if (!schedule.id) {
        const scheduleId = await createSchedule({
          ...schedule,
          is_active: true,
        });
        scheduleIds.push(scheduleId);
      } else {
        scheduleIds.push(schedule.id);
      }
    }

    const createReminderModel = omit(reminder, "schedules");
    const reminderId = await createReminder({
      ...(createReminderModel as InsertReminder),
      is_recurring: true,
      scheduleIds,
    });

    setCreatedReminderId(reminderId);
    setPageState(6);
    sendConfetti();
  }

  function PageStateComponent() {
    switch (pageState) {
      case 0:
        return <Welcome0 onNext={() => setPageState(1)} />;
      case 1:
        return (
          <ReminderIntro1 onNext={(reminder) => onNextHandler(2, reminder)} />
        );
      case 2:
        return (
          <Notes2
            onNext={(reminder) => onNextHandler(3, reminder)}
            reminder={builtReminder}
          />
        );
      case 3:
        return (
          <Frequency3
            onNext={(reminder) => onNextHandler(4, reminder)}
            reminder={builtReminder}
          />
        );
      case 4:
        return (
          <Schedules4
            onNext={(reminder) => onNextHandler(5, reminder)}
            reminder={builtReminder}
          />
        );
      case 5:
        return (
          <AdvancedSettings5
            onNext={(reminder) =>
              completeReminder({ ...builtReminder, ...reminder })
            }
            reminder={builtReminder}
          />
        );
      case 6:
        return (
          <Confirm6
            onNext={() => setPageState(7)}
            reminderId={createdReminderId}
          />
        );

      default:
        return null;
    }
  }

  return (
    <ThemedContainer>
      <PageStateComponent />
    </ThemedContainer>
  );
}
