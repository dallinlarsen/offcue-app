import { ScrollView, Switch } from "react-native";
import { VStack } from "../ui/vstack";
import { Input, InputField } from "../ui/input";
import { Textarea, TextareaInput } from "../ui/textarea";
import { Heading } from "../ui/heading";
import { Box } from "../ui/box";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "../ui/select";
import { Text } from "@/components/ui/text";
import { FREQUENCY_TYPES } from "@/constants/utils";
import { HStack } from "../ui/hstack";
import { Card } from "../ui/card";
import { formatScheduleString } from "@/lib/utils";
import { Pressable } from "../ui/pressable";
import { AddIcon, ChevronDownIcon, CloseIcon, Icon } from "../ui/icon";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import colors from "tailwindcss/colors";
import { ScheduleActionsheet } from "./ScheduleActionsheet";
import { Reminder } from "@/lib/types";
import { useState } from "react";
import { createReminder, updateReminder } from "@/lib/db-service";

type AddEditReminderProps = {
  data: Reminder;
  onSave: () => void;
};

export default function AddEditReminder({
  data,
  onSave,
}: AddEditReminderProps) {
  const [model, setModel] = useState(data);
  const [schedulesOpen, setSchedulesOpen] = useState(false);

  const handleSave = async () => {
    if (!model.title || !model.interval_type || !model.times) {
      alert("Please fill in all required fields: Title, Frequency, and Times.");
      return;
    }

    try {
      if (data.id) {
        await updateReminder(
          data.id,
          model.title,
          model.description || "",
          model.interval_type,
          model.interval_num,
          model.times,
          model.schedules.map((s) => s.id),
          model.track_streak,
          model.track_notes,
          model.is_muted
        );
      } else {
        await createReminder(
          model.title,
          model.description || '',
          model.interval_type,
          model.interval_num,
          model.times,
          model.schedules.map((s) => s.id),
          model.track_streak,
          false,
          false
        );
      }
      onSave();
    } catch (error) {
      console.error("Error saving reminder:", error);
      alert("Error saving reminder. Please try again.");
    }
  };

  return (
    <>
      <ScrollView>
        <VStack space="xl">
          <VStack space="sm">
            <Input size="xl">
              <InputField
                placeholder="Title"
                value={model.title}
                onChangeText={(text) => setModel({ ...model, title: text })}
              />
            </Input>
            <Textarea size="xl">
              <TextareaInput
                placeholder="Description"
                value={model.description}
                onChangeText={(text) =>
                  setModel({ ...model, description: text })
                }
              />
            </Textarea>
          </VStack>
          <VStack>
            <Heading size="xl">Every</Heading>
            <Box className="flex flex-row gap-2">
              <Input size="xl" className="flex-1">
                <InputField
                  placeholder="Frequency"
                  value={model.interval_num.toString()}
                  onChangeText={(text) =>
                    setModel({ ...model, interval_num: text as any })
                  }
                  keyboardType="number-pad"
                />
              </Input>
              <Select
                className="flex-1"
                selectedValue={model.interval_type}
                onValueChange={(value) =>
                  setModel({ ...model, interval_type: value })
                }
              >
                <SelectTrigger
                  variant="outline"
                  size="xl"
                  className="flex justify-between"
                >
                  <SelectInput placeholder="Select Option" />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {FREQUENCY_TYPES.map((t) => (
                      <SelectItem
                        key={t.value}
                        label={t.label}
                        value={t.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </Box>
          </VStack>
          <Box>
            <Heading size="xl">Remind Me</Heading>
            <Box className="flex flex-row w-full gap-2 items-center">
              <Input size="xl" className="flex-1">
                <InputField
                  placeholder="Times"
                  value={model.times.toString()}
                  onChangeText={(text) =>
                    setModel({ ...model, times: text as any })
                  }
                  keyboardType="number-pad"
                />
              </Input>
              <Text size="xl" className="flex-1">
                Time(s)
              </Text>
            </Box>
          </Box>
          <VStack>
            <Heading size="xl">But Only On</Heading>
            {model.schedules.length > 0 ? (
              <>
                <VStack space="sm">
                  {model.schedules.map((schedule) => (
                    <Card key={schedule.id} variant="filled">
                      <HStack className="justify-between items-center">
                        <HStack space="md" className="items-end">
                          <Text size="xl" className="font-semibold">
                            {schedule.label || "No Label"}
                          </Text>
                          <Text>
                            {formatScheduleString(
                              schedule.start_time,
                              schedule.end_time,
                              [
                                schedule.is_sunday && "sunday",
                                schedule.is_monday && "monday",
                                schedule.is_tuesday && "tuesday",
                                schedule.is_wednesday && "wednesday",
                                schedule.is_thursday && "thursday",
                                schedule.is_friday && "friday",
                                schedule.is_saturday && "saturday",
                              ].filter((d) => !!d) as any
                            )}
                          </Text>
                        </HStack>
                        <Pressable
                          onPress={() =>
                            setModel({
                              ...model,
                              schedules: model.schedules.filter(
                                (s) => s.id !== schedule.id
                              ),
                            })
                          }
                          className="p-3 -m-3"
                        >
                          <Icon as={CloseIcon} size="lg" />
                        </Pressable>
                      </HStack>
                    </Card>
                  ))}
                </VStack>
                <HStack className="justify-between">
                  <Box></Box>
                  <Button
                    variant="link"
                    size="xl"
                    onPress={() => setSchedulesOpen(true)}
                  >
                    <ButtonIcon as={AddIcon} />
                    <ButtonText>Schedule</ButtonText>
                  </Button>
                </HStack>
              </>
            ) : (
              <Button
                size="xl"
                variant="outline"
                onPress={() => setSchedulesOpen(true)}
              >
                <ButtonIcon as={AddIcon} />
                <ButtonText>Schedule</ButtonText>
              </Button>
            )}
          </VStack>
          <HStack space="xl" className="items-center">
            <Text size="xl" className="font-quicksand-semibold">
              Track Streak
            </Text>
            <Switch
              value={model.track_streak}
              onValueChange={(track) =>
                setModel({ ...model, track_streak: track })
              }
              trackColor={{ false: colors.gray[300], true: colors.gray[500] }}
              thumbColor={colors.gray[50]}
              ios_backgroundColor={colors.gray[300]}
            />
          </HStack>
        </VStack>
      </ScrollView>
      <Button size="xl" onPress={handleSave}>
        <ButtonText>Save Reminder</ButtonText>
      </Button>
      <ScheduleActionsheet
        isOpen={schedulesOpen}
        setIsOpen={setSchedulesOpen}
        addSchedule={(schedule) =>
          setModel({ ...model, schedules: [...model.schedules, schedule] })
        }
        filterIds={model.schedules.map((s) => s.id)}
      />
    </>
  );
}
