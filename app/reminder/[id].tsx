import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Heading } from "@/components/ui/heading";
import { ArrowLeftIcon, EditIcon, Icon } from "@/components/ui/icon";
import { getReminder } from "@/lib/db-service";
import { Reminder } from "@/lib/types";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import ReminderDetails from "@/components/reminder/ReminderDetails";
import Fade from "@/components/Fade";

export default function ReminderDetailsPage() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const [reminder, setReminder] = useState<Reminder | null>(null);

  async function fetchData() {
    const data = await getReminder(parseInt(id as string));
    setReminder(data);
  }

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return reminder ? (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2">
        <TouchableOpacity className="p-3" onPress={() => router.replace("/")}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading
          numberOfLines={1}
          ellipsizeMode="tail"
          size="3xl"
          className="flex-1"
        >
          {reminder.title}
        </Heading>
      </Box>
      <ReminderDetails
        reminder={reminder}
        onNotificationResponse={() => fetchData()}
      />
      {!reminder.is_completed && (
        <Fab size="lg" onPress={() => router.push(`/reminder/edit/${id}`)}>
          <FabIcon as={EditIcon} size="xl" />
        </Fab>
      )}
      <Fade />
    </ThemedContainer>
  ) : (
    <ThemedContainer />
  );
}
