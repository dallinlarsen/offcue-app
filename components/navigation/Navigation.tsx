import { useRouter } from "expo-router";
import { HStack } from "../ui/hstack";
import NavigationItem from "./NavigationItem";
import { VStack } from "../ui/vstack";
import {
  BoxIcon,
  CalendarDaysIcon,
  Icon,
  SettingsIcon,
  ChartBarIcon,
} from "../ui/icon";
import { useRouteInfo } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import useWatch from "@/hooks/useWatch";
import { useHasHomeButton } from "@/hooks/useHasHomeButton";

export default function () {
  const router = useRouter();
  const route = useRouteInfo();
  const hasHomeButton = useHasHomeButton();

  const [activeItem, setActiveItem] = useState<
    "reminders" | "schedules" | "analytics" | "settings"
  >("reminders");

  useEffect(() => {
    if (route.pathname.startsWith("/schedules")) {
      setActiveItem("schedules");
    } else if (route.pathname.startsWith("/analytics")) {
      setActiveItem("analytics");
    } else if (route.pathname.startsWith("/settings")) {
      setActiveItem("settings");
    } else {
      setActiveItem("reminders");
    }
  }, []);

  useWatch(route.pathname, (val) => {
    if (val.startsWith("/schedules")) {
      setActiveItem("schedules");
    } else if (val.startsWith("/analytics")) {
      setActiveItem("analytics");
    } else if (val.startsWith("/settings")) {
      setActiveItem("settings");
    } else {
      setActiveItem("reminders");
    }
  });

  return (
    <HStack className={`w-full pt-6 ${hasHomeButton ? "pb-2" : ""}`}>
      <NavigationItem
        label="Reminders"
        onPress={() => router.dismissTo("/")}
        active={activeItem === "reminders"}
        iconNode={
          <VStack>
            <HStack>
              <Icon
                as={BoxIcon}
                size="2xs"
                className={
                  activeItem === "reminders"
                    ? "text-typography-950"
                    : "text-typography-500"
                }
              />
              <Icon
                as={BoxIcon}
                size="2xs"
                className={
                  activeItem === "reminders"
                    ? "text-typography-950"
                    : "text-typography-500"
                }
              />
            </HStack>
            <HStack>
              <Icon
                as={BoxIcon}
                size="2xs"
                className={
                  activeItem === "reminders"
                    ? "text-typography-950"
                    : "text-typography-500"
                }
              />
              <Icon
                as={BoxIcon}
                size="2xs"
                className={
                  activeItem === "reminders"
                    ? "text-typography-950"
                    : "text-typography-500"
                }
              />
            </HStack>
          </VStack>
        }
      />
      <NavigationItem
        label="Schedules"
        iconSvg={CalendarDaysIcon}
        onPress={() => router.dismissTo("/schedules")}
        active={activeItem === "schedules"}
      />
      <NavigationItem
        label="Analytics"
        iconSvg={ChartBarIcon}
        onPress={() => router.dismissTo("/analytics")}
        active={activeItem === "analytics"}
      />
      <NavigationItem
        label="Settings"
        iconSvg={SettingsIcon}
        onPress={() => router.dismissTo("/settings")}
        active={activeItem === "settings"}
      />
    </HStack>
  );
}
