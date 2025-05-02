import { ScrollView } from "react-native";
import { VStack } from "../ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { ChevronRightIcon } from "../ui/icon";
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
import { InsertReminder, InsertReminderModel } from "@/lib/reminders/reminders.types";

type Props = {
  onNext: (reminder: Partial<InsertReminderModel>) => void;
  reminder: Partial<InsertReminderModel>;
};

const ZodSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
});

export default function Notes2({ onNext, reminder }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      title: reminder.title || "",
      description: reminder.description || "",
    },
  });

  const nextPressedHandler = handleSubmit(async (model) => {
    onNext(model);
  });

  return (
    <VStack className="justify-between flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="sm">
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
      </ScrollView>
      <Button size="xl" onPress={nextPressedHandler}>
        <ButtonText>Next</ButtonText>
        <ButtonIcon as={ChevronRightIcon} />
      </Button>
    </VStack>
  );
}
