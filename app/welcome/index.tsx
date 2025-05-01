import { ThemedContainer } from "@/components/ThemedContainer";
import ReminderIntro1 from "@/components/welcome/ReminderIntro1";
import Welcome0 from "@/components/welcome/Welcome0";
import useWatch from "@/hooks/useWatch";
import { updateSettings } from "@/lib/settings/settings.source";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function () {
  const router = useRouter();

  const [pageState, setPageState] = useState(0);

  useWatch(pageState, (value) => {
    if (value >= 2) {
      updateSettings({ has_completed_tutorial: true });
      router.replace("/");
    }
  });

  function PageStateComponent() {
    switch (pageState) {
      case 0:
        return <Welcome0 onNext={() => setPageState(1)} />;
      case 1:
        return <ReminderIntro1 onNext={() => setPageState(2)} />;
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
