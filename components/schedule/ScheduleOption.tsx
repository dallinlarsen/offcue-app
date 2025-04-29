import { TouchableOpacity } from "react-native";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { ChevronRightIcon, Icon } from "../ui/icon";
import { formatScheduleString } from "@/lib/utils/format";
import { Schedule } from "@/lib/schedules/schedules.types";
import { useRouter } from "expo-router";

type Props = {
    schedule: Schedule;
}

export default function({ schedule }: Props) {
    const router = useRouter();

    return (
      <TouchableOpacity
        onPress={() => router.push(`/schedules/${schedule.id}`)}
        className="mb-4"
      >
        <Card key={schedule.id} variant="filled">
          <HStack className="justify-between items-center flex-wrap">
            <Box className="py-4 pl-4 -my-4 mr-4 -ml-4 flex-1">
              <HStack className="items-end flex-wrap -ml-2">
                <Text
                  numberOfLines={1}
                  size="xl"
                  className="font-semibold ml-2"
                >
                  {schedule.label || "No Label"}
                </Text>
                <Text className="ml-2">{formatScheduleString(schedule)}</Text>
              </HStack>
            </Box>
            <Box className="p-5 -m-5 pr-6">
              <Icon size="lg" as={ChevronRightIcon}></Icon>
            </Box>
          </HStack>
        </Card>
      </TouchableOpacity>
    );
}