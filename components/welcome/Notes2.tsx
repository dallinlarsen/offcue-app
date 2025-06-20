import { findNodeHandle } from "react-native";
import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "../ui/icon";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { Controller, useForm } from "react-hook-form";
import { Input, InputField } from "../ui/input";
import { Textarea, TextareaInput } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertReminderModel } from "@/lib/reminders/reminders.types";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { HStack } from "../ui/hstack";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRef } from "react";

type Props = {
  onNext: (reminder: Partial<InsertReminderModel>) => void;
  onPrevious: (reminder: Partial<InsertReminderModel>) => void;
  reminder: Partial<InsertReminderModel>;
};

const ZodSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
});

export default function Notes2({ onNext, onPrevious, reminder }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitted },
  } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      title: reminder.title || "",
      description: reminder.description?.trim() || "",
    },
  });

  const scrollViewRef = useRef<any>(null);

  const nextPressedHandler = handleSubmit(async (model) => {
    onNext({
      ...model,
      description: model.description?.trim() || "",
    });
  });

  function previousPressedHandler() {
    onPrevious(reminder);
  }

  function _scrollToInput(reactNode: React.ReactNode) {
    scrollViewRef.current.scrollToFocusedInput(reactNode);
  }

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
      extraHeight={20}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <VStack className="justify-between flex-1">
        <VStack>
          <Heading size="2xl" className="mb-2">
            Add a description
          </Heading>

          <Heading size="xl" className="font-quicksand-bold">
            Need a little extra motivation? ✨
          </Heading>
          <Text size="2xl" className="leading-normal mt-2 mb-2">
            Every reminder lets you add an{" "}
            <Heading size="xl" className="font-quicksand-bold">
              optional description
            </Heading>
            . Perfect if you want to keep the{" "}
            <Heading size="xl" className="font-quicksand-bold">
              title short 📝
            </Heading>{" "}
            or give yourself a{" "}
            <Heading size="xl" className="font-quicksand-bold">
              boost of encouragement
            </Heading>{" "}
            to get it done! 💪
          </Text>
          <VStack space="sm" className="mt-6">
            <FormControl isInvalid={!!errors.title}>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input size="xl">
                    <InputField
                      placeholder="Title"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors?.title?.message || ""}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Textarea size="xl">
                    <TextareaInput
                      placeholder="Description"
                      value={value as string | undefined}
                      onBlur={onBlur}
                      onFocus={(event) => {
                        _scrollToInput(findNodeHandle(event.target));
                      }}
                      onChangeText={onChange}
                    />
                  </Textarea>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors?.description?.message || ""}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </VStack>
        </VStack>
        <HStack space="sm">
          <Button
            className="flex-1"
            size="xl"
            variant="outline"
            onPress={previousPressedHandler}
          >
            <ButtonIcon as={ChevronLeftIcon} />
            <ButtonText>Previous</ButtonText>
          </Button>
          <Button
            className="flex-1"
            size="xl"
            onPress={nextPressedHandler}
            isDisabled={!isValid && isSubmitted}
          >
            <ButtonText>Next</ButtonText>
            <ButtonIcon as={ChevronRightIcon} />
          </Button>
        </HStack>
      </VStack>
    </KeyboardAwareScrollView>
  );
}
