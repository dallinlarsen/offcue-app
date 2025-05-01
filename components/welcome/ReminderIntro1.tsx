import { Box } from "../ui/box";
import { Heading } from "../ui/heading";
import { Image } from "expo-image";
import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronRightIcon } from "../ui/icon";
import { ScrollView, TouchableOpacity } from "react-native";
import { Card } from "../ui/card";
import { Text } from "../ui/text";
import Fade from "../Fade";

const HABITS = [
  "💧 Drink a glass of water",
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
  onNext: () => void;
};

export default function ReminderIntro1({ onNext }: Props) {
  return (
    <VStack className="justify-between flex-1">
      <Box>
        <Heading size="2xl" className="mb-2">
          What habit do you want to build?
        </Heading>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg">
          {HABITS.map((h, idx) => (
            <TouchableOpacity key={idx} onPress={onNext}>
              <Card variant="filled">
                <Text size="xl">{h}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </VStack>
        <Box className="h-24" />
      </ScrollView>
      <Fade />
    </VStack>
  );
}
