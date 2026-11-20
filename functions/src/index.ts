import { onRequest } from 'firebase-functions/v2/https';
import { COMMON_FUNCTION_OPTIONS } from './functionOptions';
export {
  instagramConfirmConnection,
  instagramDisconnect,
  instagramOAuthCallback,
  instagramOAuthStart,
  instagramPendingConnection,
  instagramReconnect,
  instagramRefresh,
} from './instagramFunctions';

export const health = onRequest(
  {
    ...COMMON_FUNCTION_OPTIONS,
    invoker: 'public',
    maxInstances: 1,
  },
  (request, response) => {
    response.set('Cache-Control', 'no-store');
    response.set('X-Content-Type-Options', 'nosniff');

    if (request.method !== 'GET') {
      response.set('Allow', 'GET');
      response.status(405).json({ status: 'method_not_allowed' });
      return;
    }

    response.status(200).json({ status: 'ok' });
  },
);
