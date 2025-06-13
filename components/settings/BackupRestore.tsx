import { backupDatabase, restoreDatabase } from "@/lib/backup/backup.service";
import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import SettingDropDown from "./SettingDropDown";
import { useStore } from "@nanostores/react";
import { Alert, AlertText } from "../ui/alert";
import { $hasUnlimited } from "@/lib/revenue-cat/revenue-cat.store";

type Props = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export default function BackupRestore({ open, setOpen }: Props) {
  const hasUnlimited = useStore($hasUnlimited);

  return (
    <SettingDropDown
      title="Backup & Restore Data"
      open={open}
      setOpen={setOpen}
    >
      { !hasUnlimited &&
      <Alert className="bg-background-100">
        <AlertText>
          This feature is available with Unlimited. Upgrade now to unlock it.
        </AlertText>
      </Alert>}
      <HStack space="md">
        <Button
          size="xl"
          className="flex-1"
          onPress={backupDatabase}
          isDisabled={!hasUnlimited}
        >
          <ButtonText>Backup</ButtonText>
        </Button>
        <Button
          size="xl"
          variant="outline"
          className="flex-1"
          onPress={restoreDatabase}
          isDisabled={!hasUnlimited}
        >
          <ButtonText>Restore</ButtonText>
        </Button>
      </HStack>
    </SettingDropDown>
  );
}
