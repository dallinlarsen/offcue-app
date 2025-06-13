import { Box } from "../ui/box";
import { Heading } from "../ui/heading";
import { VStack } from "../ui/vstack";
import { ScrollView, TouchableOpacity } from "react-native";
import { Card } from "../ui/card";
import { Text } from "../ui/text";
import Fade from "../Fade";
import {
  InsertReminderModel,
} from "@/lib/reminders/reminders.types";
import { ButtonIcon, ButtonText, Button } from "../ui/button";
import { CloseIcon } from "../ui/icon";
import { useRouter } from "expo-router";
import { useSettings } from "@/hooks/useSettings";

const HABITS = [
  "💧 Drink a glass of water",
  "☎️ Reach out to an old friend",
  "🧘 Take 3 deep breaths",
  "📚 Read one paragraph of a book",
  "🧹 Tidy up one item or surface",
  "💪 Do 10 push-ups",
  "💭 Write one thing you're grateful for",
  "👀 Don't look at screens for 2 minutes",
  "📱 Send a kind message to someone",
  "🛏️ Lie down and rest eyes for 2 minutes",
  "🧠 Dump thoughts into a note",
  "🥕 Eat a fruit or vegetable",
  "🚶 Take a quick walk",
  "🎧 Listen to calming music for 1 minute",
  "🎯 Review one personal goal",
  "📷 Take a photo of something beautiful",
  "🔒 Sit still in silence for 1 minute",
  "🌳 Step outside and get fresh air",
  "🦶 Roll feet over a ball or water bottle",
  "🔊 Say a positive affirmation out loud",
  "🎨 Doodle or sketch for 1 minute",
  "🧴 Apply lotion to hands or face",
  "📦 Put away one thing not in its place",
  "🧺 Toss one item no longer needed",
  "⏸️ Take a 1-minute pause",
  "🔋 Check in on energy level",
  "🔎 Observe five things in the room",
  "🧃 Sip something nourishing",
  "🪞 Smile at the reflection in a mirror",
  "🔔 Stretch arms overhead and breathe",
  "💡 Write down a random idea",
];

type Props = {
  onNext: (reminder: Partial<InsertReminderModel>) => void;
};

export default function ReminderIntro1({ onNext }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  return (
    <VStack className="justify-between flex-1">
      <Box>
        <Heading size="2xl" className="mb-2">
          Pick your first habit 🤔
        </Heading>
        <Text size="2xl" className="leading-normal mt-2 mb-2">
          offcue will help you build habits or remember to do things{" "}
          <Heading size="xl" className="font-quicksand-bold">
            with random nudges. 📣{" "}
          </Heading>
          It will help you track your follow-through and motivate you along the
          way! ✅
        </Text>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg">
          {HABITS.map((h, idx) => (
            <TouchableOpacity key={idx} onPress={() => onNext({ title: h })}>
              <Card variant="filled">
                <Text size="xl">{h}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </VStack>
        <Box className="h-24" />
      </ScrollView>
      <Fade />
      {settings?.has_completed_tutorial && (
        <Button
          size="xl"
          variant="outline"
          onPress={() => router.dismissTo("/settings")}
        >
          <ButtonIcon as={CloseIcon} />
          <ButtonText>Close Tutorial</ButtonText>
        </Button>
      )}
    </VStack>
  );
}
