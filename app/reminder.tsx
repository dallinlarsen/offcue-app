import React, { useState, useEffect } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAllReminders, getReminderNotifications } from "@/lib/db-source";
import { ThemedContainer } from "@/components/ThemedContainer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Fab, FabIcon } from "@/components/ui/fab";
import { EditIcon } from "@/components/ui/icon";

export default function ReminderDetails() {
    const { id } = useLocalSearchParams();
    const reminderId = Number(id);
    const router = useRouter();

    const [reminder, setReminder] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            // Fetch reminders and find the one matching the id
            const reminders = await getAllReminders();
            const foundReminder = reminders.find((r: any) => r.id === reminderId);
            setReminder(foundReminder);

            // Fetch notifications for this reminder
            const notifs = await getReminderNotifications(reminderId);
            setNotifications(notifs);
            setLoading(false);
        }
        loadData();
    }, [reminderId]);

    if (loading) {
        return (
            <ThemedContainer>
                <ActivityIndicator size="large" />
            </ThemedContainer>
        );
    }

    if (!reminder) {
        return (
            <ThemedContainer>
                <Text>Reminder not found.</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: "blue" }}>Go Back</Text>
                </TouchableOpacity>
            </ThemedContainer>
        );
    }

    return (
        <ThemedContainer>
            <Heading size="2xl">{reminder.title}</Heading>
            <Text>{reminder.description}</Text>
            <Text>
                Interval: {reminder.interval_num} {reminder.interval_type}
            </Text>
            <Text>Times per interval: {reminder.times}</Text>

            <Heading size="lg" style={{ marginTop: 20 }}>
                Notifications
            </Heading>
            {notifications.length === 0 ? (
                <Text>No notifications found for this reminder.</Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Card variant="outline" style={{ marginBottom: 10, padding: 10 }}>
                            <Text>
                                Scheduled At:{" "}
                                {new Date(item.scheduled_at).toLocaleString()}
                            </Text>
                            <Text>Status: {item.status || "pending"}</Text>
                            {item.response_at && (
                                <Text>
                                    Responded At:{" "}
                                    {new Date(item.response_at).toLocaleString()}
                                </Text>
                            )}
                        </Card>
                    )}
                />
            )}

            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                <Text style={{ color: "blue" }}>Go Back</Text>
            </TouchableOpacity>
            <Fab size="lg" onPress={() => router.push(`/reminder/edit/${id}`)}>
                <FabIcon as={EditIcon} />
            </Fab>
        </ThemedContainer>
    );
}