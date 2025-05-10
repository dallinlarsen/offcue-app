import { getSettings, updateSettings } from "@/lib/settings/settings.service";
import { Settings } from "@/lib/settings/settings.types";
import React, { createContext, useContext, useEffect, useState } from "react";

type SettingsContextType = {
    settings: Settings | null;
    updateSettings: (settings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    updateSettings: (settings) => { updateSettings(settings) },
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      setSettings(await getSettings());
    }
    fetchSettings();
  }, []);

  async function updateSettingsContext(settings: Partial<Settings>) {
    await updateSettings(settings);
    setSettings(await getSettings());
  }

  return (
    <SettingsContext.Provider value={{
        settings,
        updateSettings: updateSettingsContext,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
