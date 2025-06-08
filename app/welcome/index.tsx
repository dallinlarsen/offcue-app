import { ThemedContainer } from "@/components/ThemedContainer";
import AdditionalSettings5 from "@/components/welcome/AdditionalSettings5";
import Confirm6 from "@/components/welcome/Confirm6";
import Frequency3 from "@/components/welcome/Frequency3";
import Notes2 from "@/components/welcome/Notes2";
import ReminderIntro1 from "@/components/welcome/ReminderIntro1";
import Schedules4 from "@/components/welcome/Schedules4";
// import SchedulesSelect7 from "@/components/welcome/SchedulesSelect7";
import Welcome0 from "@/components/welcome/Welcome0";
import { useConfetti } from "@/hooks/useConfetti";
import { useSettings } from "@/hooks/useSettings";
import useWatch from "@/hooks/useWatch";
import { createReminder } from "@/lib/reminders/reminders.service";
import {
  InsertReminder,
  InsertReminderModel,
} from "@/lib/reminders/reminders.types";
import { createSchedule } from "@/lib/schedules/schedules.service";
import { Schedule } from "@/lib/schedules/schedules.types";
import omit from "lodash/omit";
import { useEffect, useState } from "react";

export default function () {
  const confetti = useConfetti();
  const { updateSettings, settings } = useSettings();

  const [pageState, setPageState] = useState(0);
  const [builtReminder, setBuiltReminder] = useState<
    Partial<InsertReminderModel>
  >({});
  const [createdReminderId, setCreatedReminderId] = useState<number | null>(
    null
  );

//   useEffect(() => {
//     if (settings?.has_completed_tutorial) setPageState(1);
//     else setPageState(0);
//   }, []);

  function onPreviousHandler(
    page: number,
    reminder: Partial<InsertReminderModel>
  ) {
    setBuiltReminder(reminder);
    setPageState(page);
  }

  function onNextHandler(page: number, reminder: Partial<InsertReminderModel>) {
    setBuiltReminder({ ...builtReminder, ...reminder });
    setPageState(page);
  }

  function onStartOverHandler() {
    setBuiltReminder({});
    setPageState(1);
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

    if (!reminderId) return;

    setCreatedReminderId(reminderId);
    updateSettings({ has_completed_tutorial: true });
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
            onPrevious={(reminder) => onPreviousHandler(1, reminder)}
            reminder={builtReminder}
          />
        );
      case 3:
        return (
          <Frequency3
            onNext={(reminder) => onNextHandler(4, reminder)}
            onPrevious={(reminder) => onPreviousHandler(2, reminder)}
            reminder={builtReminder}
          />
        );
      case 4:
        return (
          <Schedules4
            onNext={(reminder) => onNextHandler(5, reminder)}
            onPrevious={(reminder) => onPreviousHandler(3, reminder)}
            reminder={builtReminder}
          />
        );
      case 5:
        return (
          <AdditionalSettings5
            onNext={(reminder) =>
              completeReminder({ ...builtReminder, ...reminder })
            }
            onPrevious={(reminder) => onPreviousHandler(4, reminder)}
            reminder={builtReminder}
          />
        );
      case 6:
        return (
          <Confirm6
            onNext={() => setPageState(7)}
            onStartOver={onStartOverHandler}
            reminderId={createdReminderId}
          />
        );
      // case 7:
      //   return <SchedulesSelect7 />;

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
