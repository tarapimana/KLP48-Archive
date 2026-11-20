# Firebase Functions deployment security

## Deployment target

`firebase-target.json` is the source of truth for the production Functions deployment target:

- Project: `gen-lang-client-0052986878`
- Region: `us-central1`
- Runtime service account: `klp48-social-tracking-runtime@gen-lang-client-0052986878.iam.gserviceaccount.com`
- Firestore database: `ai-studio-arkibklp48-f3c5dd98-ac70-4d70-b779-c307d3b910a6`

`src/functionOptions.ts` applies the configured region and service-account identity to every exported HTTP function, including the health endpoint. To change the region or runtime identity, update `firebase-target.json`; do not put credentials or private keys in the repository. The deploy preflight requires the selected project to match the configured production project and validates the configured region and service-account email format and project. It reports the selected project, region, and identity before deployment.

The preflight cannot verify that the service account exists, that its IAM grants are correct, or that the deployed Cloud Run services actually use the expected settings. Those checks require Google Cloud access. The configured identity is a dedicated account name, not a credential; the deployer must be allowed to attach it.

If the Functions region changes, the deployed callback URL changes too. Update `INSTAGRAM_REDIRECT_URI` and the matching redirect URI in the Meta app configuration to the exact deployed callback URL before enabling OAuth. Do not perform live OAuth as part of this change.

## Minimum runtime IAM

Grant the runtime service account only the following access, preferably at the narrowest supported resource scope:

| Purpose | Minimum permission / role | Scope |
| --- | --- | --- |
| Named Firestore database reads and writes | Custom role with `datastore.databases.get`, `datastore.entities.get`, `datastore.entities.list`, `datastore.entities.create`, `datastore.entities.update`, and `datastore.entities.delete`; alternatively `roles/datastore.user` | Bind with an IAM condition matching `resource.name == "projects/PROJECT_ID/databases/DATABASE_ID"` so the grant is limited to the configured database. An unconditional project-level `roles/datastore.user` can grant access to other databases. |
| Read `META_APP_SECRET` | `secretmanager.versions.access` (`roles/secretmanager.secretAccessor`) | Bind on the single Secret Manager secret, not the project, where possible. |
| Verify Firebase ID tokens and check revocation | `firebaseauth.users.get`; the predefined `roles/firebaseauth.viewer` includes this permission | Firebase project. Token signature verification alone uses Firebase public keys; `verifyIdToken(idToken, true)` also checks user/revocation state. |
| Application-written Cloud Logging entries, if added later | `logging.logEntries.create` (`roles/logging.logWriter`) | Project or destination scope used by the Logging API. The current application does not call the Cloud Logging API. |

Cloud Functions/Cloud Run captures container stdout and stderr into Cloud Logging through the platform; this does not require granting the runtime account `roles/logging.logWriter` for the current code. Do not add that role unless application code begins writing directly through the Logging API. The platform-managed request logs are separate and are not controlled by application logging statements.

The deployment principal also needs `iam.serviceAccounts.actAs` on the dedicated runtime account (commonly provided by `roles/iam.serviceAccountUser` bound on that account) to deploy a function that runs as it. This is a deployer permission, not a runtime permission. Do not grant Owner or Editor as a substitute for the permissions above.

## Cloud Logging: OAuth callback URL exposure

Firebase Functions v2 runs on Cloud Run. Cloud Run request logs can include the complete incoming URL in `httpRequest.requestUrl`. The public `instagramOAuthCallback` URL carries OAuth `code` and `state` query parameters, so platform-generated request logs can expose those values even though application code does not log the request. Outgoing Meta token exchange and refresh requests also contain sensitive values in their URLs; do not enable HTTP instrumentation or APM that records full URLs, headers, bodies, or provider responses without proven redaction.

Repository code cannot change Cloud Run request-log routing or redact fields in platform-generated request logs. In Google Cloud Console, configure a Log Router exclusion on the `_Default` sink for callback request entries. First confirm the actual Cloud Run service name and resource labels in Logs Explorer, then use a filter scoped to the production project and callback service. For example:

```text
resource.type="cloud_run_revision"
logName="projects/PROJECT_ID/logs/run.googleapis.com%2Frequests"
httpRequest.requestUrl:"/instagramOAuthCallback"
```

Use the actual project ID and add the confirmed `resource.labels.service_name` restriction where it matches your deployment. Save the exclusion on `_Default`; separately review every custom sink, alert, archive, or export that could route the same entries. Validate routing with a safe request that contains no OAuth values, not a live authorization.

A log exclusion changes routing to that sink; it is **not field-level redaction**. It does not scrub the URL from entries routed to other sinks, rewrite already-stored entries, or remove copies already exported elsewhere. Review bucket retention and access policies separately. Do not claim callback URLs are protected until the Google Cloud configuration is applied and verified.

## Endpoint access and application logging

All Functions retain a public HTTP invoker so the external Meta OAuth callback can reach the service and the admin frontend can call its endpoints. The callback remains public by design. Other state-changing endpoints continue to enforce Firebase Admin verification on the server with revocation checking and the configured administrator identity; do not replace this with a client-only check or remove `requireVerifiedAdmin`.

The Functions application source currently emits no application logs. Do not log request URLs or query strings, OAuth codes or state, access/refresh tokens, authorization headers, secret values, raw provider responses, or exceptions that may contain those values. Return sanitized error codes as the handlers currently do. The source-level test guards against adding direct console/logger calls; it does not govern platform-generated logs or third-party instrumentation.

## Google Cloud Console work still required

Before deployment or production OAuth use:

1. Create or confirm the dedicated runtime service account named above in the production project. No service account or other Google Cloud resource was created by this repository change.
2. Bind the minimum runtime permissions above. Bind `roles/iam.serviceAccountUser` to the deployment principal on this service account so deployment can attach it.
3. In the Functions/Cloud Run service IAM settings, confirm the OAuth callback remains publicly invokable. Keep application-level admin verification on protected endpoints.
4. Add and verify the Cloud Logging exclusion for the callback request URL on `_Default`, and review custom sinks and exports.
5. Confirm the final callback URL is aligned across the deployed function, `INSTAGRAM_REDIRECT_URI`, and Meta app settings.
6. Confirm no production APM/HTTP instrumentation captures outgoing request URLs, authorization headers, request bodies, or provider response payloads.

These steps were not performed by the repository change. Production IAM, secrets, data, deployments, and Google Cloud resources were not accessed or modified.
