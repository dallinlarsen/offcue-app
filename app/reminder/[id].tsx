import { ThemedContainer } from "@/components/ThemedContainer";
import { Box } from "@/components/ui/box";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Heading } from "@/components/ui/heading";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
  RepeatIcon,
} from "@/components/ui/icon";
import { getReminder, updateReminderMuted } from "@/lib/db-service";
import { Reminder } from "@/lib/types";
import { formatFrequencyString, formatScheduleString } from "@/lib/utils";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { TouchableOpacity } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Switch } from "@/components/ui/switch";
import colors from "tailwindcss/colors";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { getReminderNotifications } from "@/lib/db-source";
import dayjs from "dayjs";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { BlurView } from "expo-blur";

export default function ReminderDetails() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nextNotification, setNextNotification] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [hideNextNotification, setHideNextNotification] = useState(true);

  async function fetchData() {
    const data = await getReminder(parseInt(id as string));
    setReminder(data);

    const notifications = await getReminderNotifications(
      parseInt(id as string)
    );
    setNotifications(notifications);

    if (notifications[0]) {
      setNextNotification({
        date: dayjs(notifications[0].scheduled_at).format("YYYY-MM-DD"),
        time: dayjs(notifications[0].scheduled_at).format("h:mm a"),
      });
    }
  }

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useFocusEffect(() => {
    fetchData();
  });

  const handleToggleMute = async (currentMuted: boolean) => {
    await updateReminderMuted(parseInt(id as string), currentMuted);
    fetchData();
  };

  return reminder ? (
    <ThemedContainer>
      <Box className="flex flex-row items-center -mt-2">
        <TouchableOpacity className="p-3" onPress={() => router.back()}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Heading numberOfLines={1} ellipsizeMode="tail" size="3xl" className="flex-1">
          {reminder.title}
        </Heading>
      </Box>
      <VStack space="md">
        {reminder.description ? (
          <Heading size="lg">{reminder.description}</Heading>
        ) : null}
        <Box>
          <HStack className="justify-between items-start">
            <VStack space="sm">
              <Text size="xl">
                {formatFrequencyString(
                  reminder.times,
                  reminder.interval_num,
                  reminder.interval_type
                )}
              </Text>
              <Box>
                {reminder.schedules.map((s) => (
                  <Text size="xl" key={s.id}>
                    {formatScheduleString(s)}
                  </Text>
                ))}
              </Box>
            </VStack>
            <HStack space="xl" className="items-center ">
              <Text size="xl" className="font-quicksand-semibold">
                Mute
              </Text>
              <Switch
                value={reminder.is_muted}
                onValueChange={(value) => handleToggleMute(value)}
                trackColor={{ false: colors.gray[300], true: colors.gray[500] }}
                thumbColor={colors.gray[50]}
                ios_backgroundColor={colors.gray[300]}
              />
            </HStack>
          </HStack>
        </Box>
        {nextNotification ? (
          <VStack space="sm">
            <Alert>
              <AlertIcon as={CheckCircleIcon} />
              <AlertText size="lg">Next Reminder on</AlertText>
              {hideNextNotification ? (
                <Box className="relative w-[180px] h-10 -ml-1 -my-2">
                  <Box className="absolute inset-0 flex items-center justify-center">
                    <AlertText size="lg">
                      {nextNotification.date} at
                      {nextNotification.time}
                    </AlertText>
                  </Box>

                  <BlurView
                    intensity={20}
                    className="absolute top-0 bottom-0 right-0 left-0"
                  />
                </Box>
              ) : (
                <AlertText size="lg">
                  {nextNotification.date} at {nextNotification.time}
                </AlertText>
              )}
            </Alert>
            <HStack space="md">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onPress={() => setHideNextNotification(!hideNextNotification)}
              >
                <ButtonIcon as={hideNextNotification ? EyeIcon : EyeOffIcon} />
                <ButtonText>
                  {hideNextNotification ? "Show" : "Hide"}
                </ButtonText>
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                <ButtonIcon as={RepeatIcon} />
                <ButtonText>Reschedule</ButtonText>
              </Button>
            </HStack>
          </VStack>
        ) : null}
      </VStack>
      <Fab size="lg" onPress={() => router.push(`/reminder/edit/${id}`)}>
        <FabIcon as={EditIcon} />
      </Fab>
    </ThemedContainer>
  ) : null;
}
