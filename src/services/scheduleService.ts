import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import type { ScheduleRawItem } from '../data/klp48Data';
import { auth, db } from '../lib/firebase';
import { isAuthorizedAdmin } from './authService';

const SCHEDULE_COLLECTION = 'schedule_events';

function getScheduleEventId(item: ScheduleRawItem): string {
  const fingerprint = [item.tarikh_mula, item.tajuk, item.lokasi, item.masa || ''].join('|').toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < fingerprint.length; index += 1) {
    hash = Math.imul(hash ^ fingerprint.charCodeAt(index), 16777619);
  }
  return `event-${item.tarikh_mula}-${(hash >>> 0).toString(36)}`;
}

function toFirestoreRecord(item: ScheduleRawItem): Omit<ScheduleRawItem, 'id'> {
  return {
    tarikh_mula: item.tarikh_mula,
    tarikh_tamat: item.tarikh_tamat || item.tarikh_mula,
    tajuk: item.tajuk,
    tajuk_en: item.tajuk_en || '',
    lokasi: item.lokasi,
    lokasi_en: item.lokasi_en || '',
    masa: item.masa || '',
    masa_en: item.masa_en || '',
    jenis: item.jenis.toLowerCase() === 'show' ? 'show' : 'event',
    eksklusif: /^(yes|ya|y|true|1)$/i.test(item.eksklusif) ? 'yes' : 'no',
    nota: item.nota || '',
    nota_en: item.nota_en || '',
    members: item.members || '',
    pautan: item.pautan || '',
  };
}

export function subscribeToScheduleEvents(
  onUpdate: (items: ScheduleRawItem[]) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, SCHEDULE_COLLECTION),
    (snapshot) => {
      onUpdate(snapshot.docs.map((scheduleDoc) => ({
        ...scheduleDoc.data(),
        id: scheduleDoc.id,
      }) as ScheduleRawItem));
    },
    onError
  );
}

export async function replaceScheduleEvents(items: ScheduleRawItem[]): Promise<void> {
  if (!isAuthorizedAdmin(auth.currentUser)) {
    throw new Error('Only the verified archive administrator can import a schedule.');
  }
  if (items.length === 0) throw new Error('The CSV contains no valid schedule events.');
  if (items.length > 250) throw new Error('Import no more than 250 events at a time.');

  const collectionRef = collection(db, SCHEDULE_COLLECTION);
  const existing = await getDocs(collectionRef);
  const records = items.map((item) => ({
    id: getScheduleEventId(item),
    data: toFirestoreRecord(item),
  }));
  const nextIds = new Set(records.map((record) => record.id));
  if (nextIds.size !== records.length) {
    throw new Error('Two CSV rows resolve to the same schedule entry. Check for duplicate events.');
  }

  const staleDocs = existing.docs.filter((scheduleDoc) => !nextIds.has(scheduleDoc.id));
  if (staleDocs.length + records.length > 500) {
    throw new Error('This replacement exceeds Firestore’s 500-write batch limit. Reduce the schedule rows and try again.');
  }

  const batch = writeBatch(db);
  staleDocs.forEach((scheduleDoc) => batch.delete(scheduleDoc.ref));
  records.forEach(({ id, data }) => batch.set(doc(collectionRef, id), data));
  await batch.commit();
}
