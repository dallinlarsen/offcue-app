import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import PagerView from 'react-native-pager-view';
import { Alert } from 'react-native';
import {
  PieChart,
  StackBarChart,
} from 'react-native-gifted-charts';
import dayjs from 'dayjs';
import { ThemedContainer } from '@/components/ThemedContainer';
import { Heading } from '@/components/ui/heading';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
} from '@/components/ui/select';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { ChevronDownIcon } from '@/components/ui/icon';
import { getReminders } from '@/lib/reminders/reminders.service';
import { Reminder } from '@/lib/reminders/reminders.types';
import {
  getResponses,
  summarizeResponses,
  groupResponsesByDate,
  ResponseRecord,
  ResponseCounts,
} from '@/lib/analytics/analytics.service';

const TIME_OPTIONS = [
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'All Time', value: 'all' },
];

export default function AnalyticsPage() {
  const { reminderId } = useLocalSearchParams();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('7');
  const [records, setRecords] = useState<ResponseRecord[]>([]);
  const [counts, setCounts] = useState<ResponseCounts | null>(null);
  const [daily, setDaily] = useState<ReturnType<typeof groupResponsesByDate>>([]);

  useEffect(() => {
    async function load() {
      const data = await getReminders();
      setReminders(data);
      if (reminderId) setSelectedReminder(String(reminderId));
    }
    load();
  }, [reminderId]);

  useEffect(() => {
    async function loadResponses() {
      const end = dayjs().format('YYYY-MM-DD');
      const start =
        timeRange === 'all'
          ? undefined
          : dayjs().subtract(parseInt(timeRange), 'day').format('YYYY-MM-DD');
      const ids = selectedReminder ? [parseInt(selectedReminder)] : undefined;
      const res = await getResponses(ids, start, end);
      setRecords(res);
      setCounts(summarizeResponses(res));
      setDaily(groupResponsesByDate(res));
    }
    loadResponses();
  }, [timeRange, selectedReminder]);

  function clearFilters() {
    setSelectedReminder('');
    setTimeRange('7');
  }

  const renderTimeline = () => (
    <HStack className="flex-wrap mt-4 justify-center">
      {records.map((r, idx) => (
        <Pressable
          key={idx}
          onPress={() =>
            Alert.alert(
              dayjs(r.scheduled_at).format('MMM D, YYYY h:mm a'),
              r.response_status,
            )
          }
        >
          <Box
            className={`w-4 h-4 m-0.5 rounded-full ${
              r.response_status === 'done'
                ? 'bg-green-500'
                : r.response_status === 'skip'
                ? 'bg-orange-500'
                : 'bg-gray-400'
            }`}
          />
        </Pressable>
      ))}
    </HStack>
  );

  return (
    <ThemedContainer className="flex-1">
      <Heading size="2xl" className="mb-4">
        Analytics
      </Heading>
      <VStack space="md">
        <Select
          selectedValue={selectedReminder}
          onValueChange={setSelectedReminder}
          initialLabel={reminders.find((r) => r.id === parseInt(selectedReminder))?.title}
        >
          <SelectTrigger variant="outline" size="xl" className="flex justify-between">
            <SelectInput placeholder="Select Reminder" />
            <SelectIcon as={ChevronDownIcon} className="mr-3" />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              <SelectItem label="All Reminders" value="" />
              {reminders.map((r) => (
                <SelectItem key={r.id} label={r.title} value={String(r.id)} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
        <Select
          selectedValue={timeRange}
          onValueChange={setTimeRange}
          initialLabel={TIME_OPTIONS.find((t) => t.value === timeRange)?.label}
        >
          <SelectTrigger variant="outline" size="xl" className="flex justify-between">
            <SelectInput placeholder="Time Range" />
            <SelectIcon as={ChevronDownIcon} className="mr-3" />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t.value} label={t.label} value={t.value} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
        <Button size="xl" variant="outline" onPress={clearFilters}>
          <ButtonText>Clear Filters</ButtonText>
        </Button>
      </VStack>
      {counts && records.length > 0 ? (
        <VStack className="mt-6 flex-1" space="md">
          <Text size="xl">Done: {counts.done}</Text>
          <Text size="xl">Skipped: {counts.skip}</Text>
          <Text size="xl">No Response: {counts.no_response}</Text>
          <Text size="sm" className="text-center">
            Swipe left or right to switch charts
          </Text>
          <PagerView style={{ flex: 1 }} initialPage={0}>
            <VStack key="timeline" className="items-center">
              {renderTimeline()}
            </VStack>
            <VStack key="pie" className="items-center">
              <PieChart
                data={[
                  { value: counts.done, color: '#22c55e' },
                  { value: counts.skip, color: '#f97316' },
                  { value: counts.no_response, color: '#9ca3af' },
                ]}
                focusOnPress
                donut
                radius={150}
              />
            </VStack>
            <VStack key="bar" className="items-center">
              <StackBarChart
                data={daily.map((d) => ({
                  label: dayjs(d.date).format('MM/DD'),
                  stacks: [
                    { value: d.done, color: '#22c55e' },
                    { value: d.skip, color: '#f97316' },
                    { value: d.none, color: '#9ca3af' },
                  ],
                }))}
                barWidth={16}
                spacing={12}
              />
            </VStack>
          </PagerView>
        </VStack>
      ) : (
        <Text className="mt-6">No data for selected filters.</Text>
      )}
    </ThemedContainer>
  );
}
