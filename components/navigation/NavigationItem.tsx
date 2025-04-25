import { ColorValue, TouchableOpacity } from "react-native";
import { VStack } from "../ui/vstack";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { IIconComponentType } from "@gluestack-ui/icon/lib/createIcon";
import { SvgProps } from "react-native-svg";
import { ReactNode } from "react";

type Props = {
  label: string;
  iconSvg?: IIconComponentType<
    | SvgProps
    | {
        fill?: ColorValue;
        stroke?: ColorValue;
      }
  >;
  iconNode?: ReactNode;
  active?: boolean
  onPress: () => void;
};

export default function({ label, iconSvg, iconNode, onPress, active }: Props) {
    return (
      <TouchableOpacity className="flex-1" onPress={onPress}>
        <VStack className="items-center" space="sm">
          {iconSvg && (
            <Icon
              as={iconSvg}
              size="lg"
              className={active ? "text-typography-950" : "text-typography-500"}
            />
          )}
          {iconNode && iconNode}
          <Text
            size="sm"
            className={active ? "text-typography-950" : "text-typography-500"}
          >
            {label}
          </Text>
        </VStack>
      </TouchableOpacity>
    );
}