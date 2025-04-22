import { TouchableOpacity } from "react-native";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Heading } from "../ui/heading";
import { ChevronDownIcon, ChevronRightIcon, Icon } from "../ui/icon";
import { ReactNode } from "react";

type Props = {
  title: string;
  children?: ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  persist?: boolean;
};

export default function SettingDropDown({
  title,
  open,
  setOpen,
  persist,
  children
}: Props) {
  return (
    <VStack space="xs">
      {persist ? (
        <Heading size="xl">
          {title}
        </Heading>
      ) : (
        <TouchableOpacity onPress={() => setOpen && setOpen(!open)}>
          <HStack space="sm" className="py-4 px-1 items-center">
            <Heading size="xl">{title}</Heading>
            {<Icon size="lg" as={open ? ChevronDownIcon : ChevronRightIcon} />}
          </HStack>
        </TouchableOpacity>
      )}

      {(open || persist) && (
        <VStack space="lg" className="-mt-2">
          {children}
        </VStack>
      )}
    </VStack>
  );
}
