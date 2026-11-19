import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Any permission error or document not found confirms network connection
    return true;
  }
}

export interface LiveStatusRecord {
  id: string;
  memberId: string;
  memberName: string;
  platform: 'tiktok' | 'instagram';
  status: 'LIVE' | 'OFFLINE' | 'UNKNOWN';
  source?: string;
  checkedAt: string;
  startedAt?: string | null;
  liveUrl?: string;
}

export interface LiveSessionRecord {
  id: string;
  memberId: string;
  memberName: string;
  platform: 'tiktok' | 'instagram';
  startedAt: string;
  endedAt: string;
  duration?: number | string;
  liveUrl?: string;
  source?: string;
}

const LIVE_STATUS_PATH = 'live_status';
const LIVE_SESSIONS_PATH = 'live_sessions';

/**
 * Real-time subscription to live_status collection.
 * Triggers callback on initial load and whenever any status updates.
 */
export function subscribeLiveStatuses(
  onUpdate: (statuses: LiveStatusRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, LIVE_STATUS_PATH);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: LiveStatusRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          memberId: data.memberId || '',
          memberName: data.memberName || '',
          platform: data.platform === 'instagram' ? 'instagram' : 'tiktok',
          status:
            data.status === 'LIVE'
              ? 'LIVE'
              : data.status === 'OFFLINE'
              ? 'OFFLINE'
              : 'UNKNOWN',
          source: data.source || '',
          checkedAt: data.checkedAt || '',
          startedAt: data.startedAt || null,
          liveUrl: data.liveUrl || '',
        });
      });
      onUpdate(records);
    },
    (error) => {
      console.warn('Live status subscription warning:', error.message);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Real-time subscription to live_sessions collection.
 * Triggers callback when historical records are present or updated.
 */
export function subscribeLiveSessions(
  onUpdate: (sessions: LiveSessionRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, LIVE_SESSIONS_PATH);
  const q = query(colRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const records: LiveSessionRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          memberId: data.memberId || '',
          memberName: data.memberName || '',
          platform: data.platform === 'instagram' ? 'instagram' : 'tiktok',
          startedAt: data.startedAt || '',
          endedAt: data.endedAt || '',
          duration: data.duration ?? 0,
          liveUrl: data.liveUrl || '',
          source: data.source || '',
        });
      });
      // Sort in-memory to avoid requiring a composite index if empty
      records.sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
      onUpdate(records);
    },
    (error) => {
      console.warn('Live sessions subscription warning:', error.message);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * One-time read test for live_status
 */
export async function getLiveStatusesOnce(): Promise<LiveStatusRecord[]> {
  try {
    const snap = await getDocs(collection(db, LIVE_STATUS_PATH));
    const records: LiveStatusRecord[] = [];
    snap.forEach((d) => {
      const data = d.data();
      records.push({
        id: d.id,
        memberId: data.memberId || '',
        memberName: data.memberName || '',
        platform: data.platform === 'instagram' ? 'instagram' : 'tiktok',
        status:
          data.status === 'LIVE'
            ? 'LIVE'
            : data.status === 'OFFLINE'
            ? 'OFFLINE'
            : 'UNKNOWN',
        source: data.source || '',
        checkedAt: data.checkedAt || '',
        startedAt: data.startedAt || null,
        liveUrl: data.liveUrl || '',
      });
    });
    return records;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, LIVE_STATUS_PATH);
  }
}

/**
 * One-time read test for live_sessions
 */
export async function getLiveSessionsOnce(): Promise<LiveSessionRecord[]> {
  try {
    const snap = await getDocs(collection(db, LIVE_SESSIONS_PATH));
    const records: LiveSessionRecord[] = [];
    snap.forEach((d) => {
      const data = d.data();
      records.push({
        id: d.id,
        memberId: data.memberId || '',
        memberName: data.memberName || '',
        platform: data.platform === 'instagram' ? 'instagram' : 'tiktok',
        startedAt: data.startedAt || '',
        endedAt: data.endedAt || '',
        duration: data.duration ?? 0,
        liveUrl: data.liveUrl || '',
        source: data.source || '',
      });
    });
    return records;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, LIVE_SESSIONS_PATH);
  }
}

// =============================================================================
// TEMPORARY ADMIN PERMISSION TEST
// REMOVE THIS FUNCTION AFTER TESTING IS COMPLETE.
// This function is NOT called automatically and NOT exported to window.
// To run: open the browser console while signed in as it.aiman2009@gmail.com,
// then execute:
//
//   import('/src/services/liveService.ts').then(m => m.runAdminPermissionTest())
//
// Or from any existing module:
//   import { runAdminPermissionTest } from './services/liveService';
//   runAdminPermissionTest();
// =============================================================================

/** Result shape returned by runAdminPermissionTest */
export interface AdminPermissionTestResult {
  passed: boolean;
  docId: string | null;
  steps: {
    authCheck: 'PASS' | 'FAIL';
    create: 'PASS' | 'FAIL' | 'SKIP';
    read: 'PASS' | 'FAIL' | 'SKIP';
    statusVerified: 'PASS' | 'FAIL' | 'SKIP';
    delete: 'PASS' | 'FAIL' | 'SKIP';
  };
  error: string | null;
}

/**
 * TEMPORARY — Firestore administrator write permission test.
 *
 * Safety guarantees:
 * - Aborts if the signed-in user is not it.aiman2009@gmail.com with emailVerified = true.
 * - Uses doc(collection(db, 'live_status')) to generate a unique auto-ID — never touches
 *   any existing document such as yi_shyan_tiktok.
 * - Creates exactly one UNKNOWN status record with source 'admin-permission-test'.
 * - Reads it back from the server (bypasses local cache) to confirm write succeeded.
 * - Deletes only the document created by this test run, inside a try/finally block.
 * - Does NOT create any live_sessions records.
 * - Does NOT create any LIVE status records.
 *
 * REMOVE this function and its result type once testing is complete.
 */
export async function runAdminPermissionTest(): Promise<AdminPermissionTestResult> {
  const result: AdminPermissionTestResult = {
    passed: false,
    docId: null,
    steps: {
      authCheck: 'FAIL',
      create: 'SKIP',
      read: 'SKIP',
      statusVerified: 'SKIP',
      delete: 'SKIP',
    },
    error: null,
  };

  // ── STEP 1: Auth guard ───────────────────────────────────────────────────
  const currentUser = auth.currentUser;
  const ADMIN_EMAIL = 'it.aiman2009@gmail.com';

  if (
    !currentUser ||
    !currentUser.email ||
    currentUser.email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
    currentUser.emailVerified !== true
  ) {
    result.steps.authCheck = 'FAIL';
    result.error =
      `Auth check failed. Expected signed-in user: ${ADMIN_EMAIL} with emailVerified=true. ` +
      `Got: email=${currentUser?.email ?? 'null'}, emailVerified=${currentUser?.emailVerified ?? 'null'}`;
    console.error('[AdminPermissionTest] ABORTED —', result.error);
    return result;
  }

  result.steps.authCheck = 'PASS';
  console.info(`[AdminPermissionTest] Auth check PASSED — signed in as ${currentUser.email} (emailVerified=${currentUser.emailVerified})`);

  // ── Generate a unique document reference (never overwrites existing docs) ─
  const colRef = collection(db, LIVE_STATUS_PATH);
  const testDocRef = doc(colRef); // auto-generated unique ID
  result.docId = testDocRef.id;

  const testPayload = {
    memberId: 'yi_shyan',
    memberName: 'Yi Shyan',
    platform: 'tiktok' as const,
    status: 'UNKNOWN' as const,
    checkedAt: new Date().toISOString(),
    source: 'admin-permission-test',
  };

  console.info(`[AdminPermissionTest] Using auto-generated doc ID: ${testDocRef.id}`);
  console.info('[AdminPermissionTest] Test payload (no LIVE status, no live_sessions):', testPayload);

  let createSucceeded = false;

  try {
    // ── STEP 2: Create ─────────────────────────────────────────────────────
    try {
      await setDoc(testDocRef, testPayload);
      createSucceeded = true;
      result.steps.create = 'PASS';
      console.info(`[AdminPermissionTest] CREATE PASSED — doc written at live_status/${testDocRef.id}`);
    } catch (createErr) {
      result.steps.create = 'FAIL';
      result.error = `CREATE failed: ${createErr instanceof Error ? createErr.message : String(createErr)}`;
      console.error('[AdminPermissionTest] CREATE FAILED —', result.error);
      return result;
    }

    // ── STEP 3: Read back (server, bypass cache) ───────────────────────────
    try {
      const snap = await getDocFromServer(testDocRef);
      if (!snap.exists()) {
        result.steps.read = 'FAIL';
        result.error = `READ failed: Document live_status/${testDocRef.id} does not exist after create.`;
        console.error('[AdminPermissionTest] READ FAILED —', result.error);
        return result;
      }
      result.steps.read = 'PASS';
      console.info(`[AdminPermissionTest] READ PASSED — document exists at live_status/${testDocRef.id}`);

      // ── STEP 4: Verify status field ───────────────────────────────────────
      const data = snap.data();
      if (data?.status === 'UNKNOWN' && data?.source === 'admin-permission-test') {
        result.steps.statusVerified = 'PASS';
        console.info(`[AdminPermissionTest] STATUS VERIFIED — status=${data.status}, source=${data.source}`);
      } else {
        result.steps.statusVerified = 'FAIL';
        result.error = `STATUS verification failed: status=${data?.status}, source=${data?.source}`;
        console.error('[AdminPermissionTest] STATUS VERIFICATION FAILED —', result.error);
        // Continue to cleanup regardless
      }
    } catch (readErr) {
      result.steps.read = 'FAIL';
      result.error = `READ failed: ${readErr instanceof Error ? readErr.message : String(readErr)}`;
      console.error('[AdminPermissionTest] READ FAILED —', result.error);
      // Fall through to finally for cleanup
    }
  } finally {
    // ── STEP 5: Delete (only if create succeeded) ──────────────────────────
    if (createSucceeded) {
      try {
        await deleteDoc(testDocRef);
        result.steps.delete = 'PASS';
        console.info(`[AdminPermissionTest] DELETE PASSED — live_status/${testDocRef.id} removed. Collection restored.`);
      } catch (deleteErr) {
        result.steps.delete = 'FAIL';
        const deleteMsg = `DELETE failed: ${deleteErr instanceof Error ? deleteErr.message : String(deleteErr)}`;
        // Preserve the original error if one already exists; append delete error
        result.error = result.error ? `${result.error} | ${deleteMsg}` : deleteMsg;
        console.error('[AdminPermissionTest] DELETE FAILED — manual cleanup required for:', testDocRef.id, deleteErr);
      }
    }
  }

  // ── Final result ──────────────────────────────────────────────────────────
  const allPassed =
    result.steps.authCheck === 'PASS' &&
    result.steps.create === 'PASS' &&
    result.steps.read === 'PASS' &&
    result.steps.statusVerified === 'PASS' &&
    result.steps.delete === 'PASS';

  result.passed = allPassed;

  if (allPassed) {
    console.info('[AdminPermissionTest] ✅ ALL STEPS PASSED — admin write permissions confirmed. Collection restored to original state.');
  } else {
    console.warn('[AdminPermissionTest] ⚠️ One or more steps failed:', result.steps);
  }

  console.table(result.steps);
  return result;
}
// =============================================================================
// END TEMPORARY ADMIN PERMISSION TEST
// =============================================================================
