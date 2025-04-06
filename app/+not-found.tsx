import { ThemedContainer } from '@/components/ThemedContainer';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedContainer>
        <Text>This screen doesn't exist.</Text>
          <Button onPress={() => router.replace('/')}>
            <ButtonText>Go to home screen!</ButtonText>
          </Button>
      </ThemedContainer>
    </>
  );
}