import * as WebBrowser from "expo-web-browser";
import { VStack } from "../ui/vstack";
import { Button, ButtonText } from "../ui/button";
import SettingDropDown from "./SettingDropDown";
import { HStack } from "../ui/hstack";

export default function LegalLinks({ open, setOpen }: { open?: boolean; setOpen?: (open: boolean) => void }) {
  async function openPrivacy() {
    await WebBrowser.openBrowserAsync("https://offcue.app/privacy-policy/");
  }

  async function openTerms() {
    await WebBrowser.openBrowserAsync("https://offcue.app/terms-of-use/");
  }

  return (
    <SettingDropDown title="Legal" open={open} setOpen={setOpen}>
      <HStack space="md">
        <Button
          size="xl"
          variant="outline"
          onPress={openPrivacy}
          className="flex-1"
        >
          <ButtonText>Privacy Policy</ButtonText>
        </Button>
        <Button
          size="xl"
          variant="outline"
          onPress={openTerms}
          className="flex-1"
        >
          <ButtonText>Terms of Use</ButtonText>
        </Button>
      </HStack>
    </SettingDropDown>
  );
}
