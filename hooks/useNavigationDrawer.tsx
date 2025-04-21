import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
} from "@/components/ui/drawer";
import React, { createContext, useContext, useState } from "react";
import { Image } from "expo-image";
import { Text } from "@/components/ui/text";
import { useAssets } from "expo-asset";
import { Box } from "@/components/ui/box";
import { TouchableOpacity } from "react-native";
import { HStack } from "@/components/ui/hstack";
import {
  CalendarDaysIcon,
  Icon,
  SettingsIcon,
  ArchiveOutlineIcon,
  BoxIcon,
  LifebouyIcon,
} from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { Divider } from "@/components/ui/divider";

type ContextValues = {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DrawerContext = createContext<ContextValues | null>(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [assets, error] = useAssets([
    require("@/assets/images/splash-icon.png"),
    require("@/assets/images/splash-icon-dark.png"),
  ]);

  return (
    <DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      <Drawer
        isOpen={drawerOpen}
        size="lg"
        onClose={() => setDrawerOpen(false)}
      >
        <DrawerBackdrop />
        <DrawerContent className="m-0 p-0">
          <VStack className="flex-1 justify-between">
            {/* Top Section */}
            <Box>
                {/* {assets?.[0] && (
                  <Image
                    source={assets[0]}
                    style={{
                      width: "100%",
                      height: 100,
                      marginTop: 56,
                      marginBottom: 16,
                    }}
                    contentFit="contain"
                  />
                )} */}
                {assets?.[1] && (
                  <Image
                    source={assets[1]}
                    style={{
                      width: "100%",
                      height: 100,
                      marginTop: 56,
                      marginBottom: 16,
                    }}
                    contentFit="contain"
                  />
                )}
              <VStack>
                <TouchableOpacity>
                  <HStack
                    className="items-center p-4 bg-background-100"
                    space="lg"
                  >
                    <VStack>
                      <HStack>
                        <Icon as={BoxIcon} size="2xs" />
                        <Icon as={BoxIcon} size="2xs" />
                      </HStack>
                      <HStack>
                        <Icon as={BoxIcon} size="2xs" />
                        <Icon as={BoxIcon} size="2xs" />
                      </HStack>
                    </VStack>
                    <Text className="font-quicksand-semibold -ml-1" size="xl">
                      Reminders
                    </Text>
                  </HStack>
                </TouchableOpacity>
                <TouchableOpacity>
                  <HStack className="items-center p-4" space="lg">
                    <Icon as={CalendarDaysIcon} />
                    <Text className="font-quicksand-semibold" size="xl">
                      Schedules
                    </Text>
                  </HStack>
                </TouchableOpacity>
                <TouchableOpacity>
                  <HStack className="items-center p-4" space="lg">
                    <Icon
                      className="fill-background-950"
                      as={ArchiveOutlineIcon}
                      size="lg"
                    />
                    <Text className="font-quicksand-semibold" size="xl">
                      Archived
                    </Text>
                  </HStack>
                </TouchableOpacity>
              </VStack>
            </Box>

            {/* Bottom Section */}
            <VStack className="pb-12">
              <Divider />
              <TouchableOpacity>
                <HStack className="items-center p-4" space="lg">
                  <Icon as={SettingsIcon} size="lg" />
                  <Text className="font-quicksand-semibold" size="xl">
                    Settings
                  </Text>
                </HStack>
              </TouchableOpacity>
              <TouchableOpacity>
                <HStack className="items-center p-4" space="lg">
                  <Icon
                    className="fill-background-950"
                    as={LifebouyIcon}
                    size="lg"
                  />
                  <Text className="font-quicksand-semibold" size="xl">
                    Help
                  </Text>
                </HStack>
              </TouchableOpacity>
            </VStack>
          </VStack>
        </DrawerContent>
      </Drawer>
      {children}
    </DrawerContext.Provider>
  );
};
