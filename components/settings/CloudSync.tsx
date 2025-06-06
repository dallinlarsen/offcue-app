import { Alert } from 'react-native';
import { useState } from 'react';
import { Button, ButtonText } from '../ui/button';
import { Text } from '../ui/text';
import SettingDropDown from './SettingDropDown';
import { syncDatabaseToCloud } from '@/lib/cloud/cloud.service';
import { useIsCloudAvailable } from 'react-native-cloud-storage';

interface Props {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export default function CloudSync({ open, setOpen }: Props) {
  const [status, setStatus] = useState<string>('');
  const cloudAvailable = useIsCloudAvailable();

  const sync = async () => {
    if (!cloudAvailable) {
      Alert.alert('iCloud Unavailable', 'Please login to iCloud');
      return;
    }
    setStatus('Syncing...');
    try {
      const updated = await syncDatabaseToCloud();
      setStatus(updated ? 'Synced' : 'Already up to date');
    } catch (e) {
      setStatus('Error');
      Alert.alert('Error', 'Failed to sync with iCloud');
    }
  };

  return (
    <SettingDropDown title="Data Management" open={open} setOpen={setOpen}>
      <Button size="xl" onPress={sync} isDisabled={!cloudAvailable}>
        <ButtonText>Sync with iCloud</ButtonText>
      </Button>
      <Text className="text-center" size="sm">
        {cloudAvailable ? status || 'Idle' : 'iCloud not available'}
      </Text>
    </SettingDropDown>
  );
}
