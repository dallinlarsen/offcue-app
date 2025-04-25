import React, { createContext, useContext, useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import {
  markDoneSkipNotificationCategoryListener,
  setupAndConfigureNotifications,
} from "@/lib/device-notifications/device-notifications.service";
import { useRouter } from "expo-router";

type NotificationContextType = {
  lastNotification: Notifications.Notification | null;
};

const NotificationContext = createContext<NotificationContextType>({
  lastNotification: null,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);

  const router = useRouter();

  useEffect(() => {
    setupAndConfigureNotifications();
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notif) => {
        console.log("Foreground Notification in Provider:", notif);
        setLastNotification(notif);
      }
    );


    const doneSkipSub = markDoneSkipNotificationCategoryListener(
      (reminderId: number) => {
        router.replace(`/reminder/${reminderId}`);
      }
    );

    return () => {
      doneSkipSub.remove();
      receivedSub.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ lastNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
