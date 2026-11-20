import type { Firestore } from 'firebase-admin/firestore';
import type { SocialPlatform } from '../../src/types/socialTracking';
import { parseSocialCurrent, parseSocialObservation } from './socialTrackingValidation';

export interface ObservationAuthorizationVersion {
  memberId: string;
  platform: SocialPlatform;
  providerAccountId: string;
  authorizationVersion: number;
}

const AUTHORIZATION_COLLECTION = 'social_accounts';
const SNAPSHOTS_COLLECTION = 'social_snapshots';
const CURRENT_COLLECTION = 'social_current';

export async function writePublicObservationIfAuthorized(
  firestore: Firestore,
  expected: ObservationAuthorizationVersion,
  value: unknown,
): Promise<boolean> {
  const observation = parseSocialObservation(value);
  if (
    observation.memberId !== expected.memberId ||
    observation.platform !== expected.platform ||
    !expected.providerAccountId ||
    !Number.isSafeInteger(expected.authorizationVersion) ||
    expected.authorizationVersion < 0
  ) return false;

  const accountRef = firestore.collection(AUTHORIZATION_COLLECTION)
    .doc(`${expected.memberId}_${expected.platform}`);
  const currentRef = firestore.collection(CURRENT_COLLECTION)
    .doc(`${expected.memberId}_${expected.platform}`);
  const snapshotRef = firestore.collection(SNAPSHOTS_COLLECTION).doc();

  return firestore.runTransaction(async (transaction) => {
    const accountSnapshot = await transaction.get(accountRef);
    const currentSnapshot = await transaction.get(currentRef);
    if (!accountSnapshot.exists) return false;

    const authorization = accountSnapshot.data();
    if (
      authorization?.authorizationStatus !== 'authorized' ||
      authorization.providerAccountId !== expected.providerAccountId ||
      authorization.authorizationVersion !== expected.authorizationVersion
    ) return false;

    if (currentSnapshot.exists) {
      let current;
      try {
        current = parseSocialCurrent(currentSnapshot.data());
      } catch {
        return false;
      }
      if (current.capturedAt.toMillis() >= observation.capturedAt.toMillis()) return false;
    }

    transaction.create(snapshotRef, observation);
    transaction.set(currentRef, observation);
    return true;
  });
}
