import { TouchableOpacity } from "react-native";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { ChevronRightIcon, Icon } from "../ui/icon";

type Props = {
    text: string;
    onPress?: () => void;
}

export default function({ onPress, text }: Props) {
    return (
      <TouchableOpacity className="mb-4" onPress={onPress}>
        <Card variant="filled">
          <HStack className="justify-between items-center flex-wrap">
            <Box className="py-4 pl-4 -my-4 mr-4 -ml-4 flex-1">
              <Text numberOfLines={1} size="xl" className="font-semibold ml-2">
                {text}
              </Text>
            </Box>
            <Box className="p-5 -m-5 pr-6">
              <Icon size="lg" as={ChevronRightIcon}></Icon>
            </Box>
          </HStack>
        </Card>
      </TouchableOpacity>
    );
}
