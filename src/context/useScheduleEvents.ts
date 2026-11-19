import { useMemo } from 'react';
import useSWRSubscription from 'swr/subscription';
import {
  parseScheduleItems,
  ScheduleRawItem,
  SCHEDULE_DATA,
} from '../data/klp48Data';
import { subscribeToScheduleEvents } from '../services/scheduleService';

const SCHEDULE_EVENTS_KEY = 'schedule-events-v1';

export function useScheduleEvents() {
  const { data, error } = useSWRSubscription<ScheduleRawItem[], Error>(
    SCHEDULE_EVENTS_KEY,
    (
      _key: string,
      { next }: { next: (error?: Error | null, data?: ScheduleRawItem[]) => void }
    ) =>
      subscribeToScheduleEvents(
        (items) => next(null, items),
        (subscriptionError) => next(subscriptionError)
      )
  );

  const isFromFirestore = data !== undefined && data.length > 0;
  const rows: ScheduleRawItem[] = isFromFirestore && data ? data : SCHEDULE_DATA;
  const events = useMemo(() => parseScheduleItems(rows), [rows]);

  return {
    events,
    rows,
    error,
    isLoading: data === undefined && !error,
    isFromFirestore,
  };
}
