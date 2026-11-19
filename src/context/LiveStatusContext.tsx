import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from 'react';
import { MEMBERS_DATA } from '../data/klp48Data';
import {
  LiveStatusRecord,
  subscribeLiveStatuses,
  testConnection,
} from '../services/liveService';

interface LiveStatusContextValue {
  liveStatuses: LiveStatusRecord[];
  firestoreConnected: boolean;
  liveCount: number;
}

// Keep provider and hook references aligned when Vite replaces this module during development.
const LiveStatusContext =
  (import.meta.hot?.data.liveStatusContext as
    | Context<LiveStatusContextValue | null>
    | undefined) ?? createContext<LiveStatusContextValue | null>(null);

if (import.meta.hot) {
  import.meta.hot.data.liveStatusContext = LiveStatusContext;
}
const ACTIVE_MEMBER_IDS = new Set(
  MEMBERS_DATA.filter((member) => member.statusCategory === 'active').map((member) =>
    member.id.toLowerCase()
  )
);

export function LiveStatusProvider({ children }: { children: ReactNode }) {
  const [liveStatuses, setLiveStatuses] = useState<LiveStatusRecord[]>([]);
  const [firestoreConnected, setFirestoreConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    testConnection().then((connected) => {
      if (isMounted) setFirestoreConnected(connected);
    });

    const unsubscribe = subscribeLiveStatuses(
      (statuses) => {
        if (isMounted) {
          setLiveStatuses(statuses);
          setFirestoreConnected(true);
        }
      },
      () => {
        if (isMounted) setFirestoreConnected(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const liveCount = useMemo(() => {
    const activeMembers = new Set<string>();

    for (const status of liveStatuses) {
      const memberId = status.memberId.trim().toLowerCase();
      if (status.status === 'LIVE' && ACTIVE_MEMBER_IDS.has(memberId)) {
        activeMembers.add(memberId);
      }
    }

    return activeMembers.size;
  }, [liveStatuses]);

  const value = useMemo(
    () => ({ liveStatuses, firestoreConnected, liveCount }),
    [liveStatuses, firestoreConnected, liveCount]
  );

  return <LiveStatusContext.Provider value={value}>{children}</LiveStatusContext.Provider>;
}

export function useLiveStatus() {
  const value = useContext(LiveStatusContext);
  if (!value) throw new Error('useLiveStatus must be used within LiveStatusProvider');
  return value;
}
