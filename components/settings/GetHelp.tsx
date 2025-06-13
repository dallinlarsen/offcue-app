import * as WebBrowser from "expo-web-browser";
import { Button, ButtonText } from "../ui/button";
import SettingDropDown from "./SettingDropDown";

type Props = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export default function GetHelp({ open, setOpen }: Props) {
  async function openWebPage() {
    await WebBrowser.openBrowserAsync("https://offcue.app/docs");
  }

  return (
    <SettingDropDown title="Help" open={open} setOpen={setOpen}>
      <Button size="xl" onPress={openWebPage}>
        <ButtonText>Get Help 🛟</ButtonText>
      </Button>
    </SettingDropDown>
  );
}
