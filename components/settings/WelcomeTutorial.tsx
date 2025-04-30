import { useRouter } from "expo-router";
import { Button, ButtonText } from "../ui/button";
import SettingDropDown from "./SettingDropDown";

type Props = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export default function WelcomeTutorial({ open, setOpen }: Props) {
  const router = useRouter();

  return (
    <SettingDropDown title="Welcome Tutorial" open={open} setOpen={setOpen}>
      <Button size="xl" onPress={() => router.replace('/welcome')}>
        <ButtonText>Open Welcome Tutorial</ButtonText>
      </Button>
    </SettingDropDown>
  );
}
