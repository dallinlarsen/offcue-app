import { ScrollView, TouchableOpacity } from "react-native";
import { Box } from "./ui/box";
import { ArrowLeftIcon, Icon } from "./ui/icon";
import { Heading } from "./ui/heading";
import EdgeFade from "./EdgeFade";

type Props = {
    text: string;
    goBack: () => void;
}

export default function({ text, goBack }: Props) {
    return (
      <Box className="items-center flex flex-row">
        <TouchableOpacity className="p-3 -ml-4" onPress={goBack}>
          <Icon as={ArrowLeftIcon} size="xl" />
        </TouchableOpacity>
        <Box className="flex flex-row items-center -mx-3 flex-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Box className="w-3" />
            <Heading
              numberOfLines={1}
              size="2xl"
              className="flex-1 font-quicksand-bold -mr-3"
            >
              {text}
            </Heading>
            <Box className="w-8" />
          </ScrollView>
          <EdgeFade left />
          <EdgeFade />
        </Box>
      </Box>
    );
}