import { Button, ButtonText } from "../ui/button";
import SettingDropDown from "./SettingDropDown";
import { presentPaywallIfNeeded } from "@/lib/utils/paywall";

type Props = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export default function PurchaseUnlimited({ open, setOpen }: Props) {
  return (
    <SettingDropDown title="Unlimited" open={open} setOpen={setOpen}>
      <Button
        size="xl"
        onPress={() =>
          presentPaywallIfNeeded("com.offcueapps.offcue.Unlimited")
        }
      >
        <ButtonText>Get Unlimited!</ButtonText>
      </Button>
    </SettingDropDown>
  );
}
