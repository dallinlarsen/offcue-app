import React, { useEffect } from "react";
import { config } from "./config";
import { Platform, View, ViewProps } from "react-native";
import { OverlayProvider } from "@gluestack-ui/overlay";
import { ToastProvider } from "@gluestack-ui/toast";
import { useColorScheme } from "nativewind";
import { ModeType } from "./types";
import useWatch from "@/hooks/useWatch";
import { useStore } from "@nanostores/react";
import { $settings } from "@/lib/settings/settings.store";
import * as NavigationBar from "expo-navigation-bar";

export function GluestackUIProvider({
  mode = "light",
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps["style"];
}) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const settings = useStore($settings);

  useWatch(settings, () => {
    setColorScheme(settings?.theme || "system");
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(
        colorScheme === "dark" ? "#181719" : "#FBFBFB"
      );
    }
  }, [colorScheme]);

  return (
    <View
      style={[
        config[colorScheme!],
        { flex: 1, height: "100%", width: "100%" },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
