import type { Timestamp } from 'firebase/firestore';
import type { CanonicalActiveMemberId } from '../data/klp48Data';

export const SOCIAL_COLLECTIONS = {
  accounts: 'social_accounts',
  snapshots: 'social_snapshots',
  current: 'social_current',
  config: 'social_tracking_config',
  logs: 'social_tracking_logs',
} as const;

export type SocialMemberId = CanonicalActiveMemberId;
export type SocialPlatform = 'instagram' | 'tiktok';
export type SocialAccountAuthorizationStatus =
  | 'pending'
  | 'authorized'
  | 'expired'
  | 'revoked'
  | 'disconnected'
  | 'error';
export type SocialAccountType = 'business' | 'creator' | 'personal' | 'unknown';
export type SocialCollectionStatus = 'success' | 'partial';
export const SOCIAL_TRACKING_ERROR_CODES = [
  'TOKEN_EXPIRED',
  'AUTH_REVOKED',
  'RATE_LIMITED',
  'PROVIDER_ERROR',
  'INVALID_RESPONSE',
  'AUTH_REQUIRED',
  'UNKNOWN_ERROR',
] as const;
export type SocialTrackingErrorCode = typeof SOCIAL_TRACKING_ERROR_CODES[number];
export type SocialTrackingTrigger = 'scheduled' | 'manual';
export type SocialTrackingRunStatus = 'running' | 'success' | 'partial' | 'failed';

/**
 * Server-only account metadata. OAuth token values are intentionally omitted from this model
 * and must be stored by a trusted backend, never returned to browser clients.
 */
export interface SocialAccount {
  memberId: SocialMemberId;
  platform: SocialPlatform;
  username: string;
  providerAccountId: string;
  authorizationStatus: SocialAccountAuthorizationStatus;
  accountType: SocialAccountType;
  authorizedAt?: Timestamp;
  accessTokenExpiresAt?: Timestamp;
  refreshTokenExpiresAt?: Timestamp;
  updatedAt: Timestamp;
}

export interface SocialObservation {
  memberId: SocialMemberId;
  platform: SocialPlatform;
  followers: number;
  following?: number;
  totalLikes?: number;
  videoCount?: number;
  mediaCount?: number;
  capturedAt: Timestamp;
  collectionStatus: SocialCollectionStatus;
}

export interface SocialSnapshot extends SocialObservation {}

export interface SocialCurrent extends SocialObservation {}

export interface SocialTrackingConfig {
  enabled: boolean;
  trackedMemberIds: SocialMemberId[];
  timezone: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface SocialTrackingLog {
  runId: string;
  startedAt: Timestamp;
  finishedAt?: Timestamp;
  trigger: SocialTrackingTrigger;
  status: SocialTrackingRunStatus;
  accountsAttempted: number;
  accountsSucceeded: number;
  accountsFailed: number;
  errorCode?: SocialTrackingErrorCode;
}

export type SocialTrackingRun = SocialTrackingLog;

export type SocialTrackingAccountOutcomeStatus = 'success' | 'partial' | 'failed' | 'skipped';

export interface SocialTrackingAccountOutcome {
  runId: string;
  memberId: SocialMemberId;
  platform: SocialPlatform;
  status: SocialTrackingAccountOutcomeStatus;
  attempts: number;
  startedAt: Timestamp;
  finishedAt: Timestamp;
  errorCode?: SocialTrackingErrorCode;
}

export interface SocialTrackingLease {
  ownerRunId: string;
  leaseExpiresAt: Timestamp;
  updatedAt: Timestamp;
}
