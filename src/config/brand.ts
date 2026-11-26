/*
 * Brand settings in one place. To rename the app (for example to "Predlytics"),
 * change these values and the "name", "slug", "scheme", bundleIdentifier and
 * package fields in app.json. Nothing else in src/ hard-codes the brand.
 */
export const BRAND = {
  /** Display name used in copy, e.g. "How Oddlytics works". */
  name: 'Oddlytics',
  /** Lower-case wordmark shown in the header and splash ("oddlytics."). */
  wordmark: 'oddlytics',
  /** Paid tier name. */
  plusName: 'Oddlytics Plus',
  /** Name of the curated slip on Bankers. */
  slipName: 'Oddlytics Slip',
  tagline: "Don't guess. Understand the game.",
  /** Prefix for keys saved on the device. Keep it stable after launch. */
  storagePrefix: 'oddlytics',
  version: '1.0.0',
  /** Shown next to kick-off times. Real app: derive from the device time zone. */
  timeZoneLabel: 'WAT',
  timeZoneName: 'Africa/Lagos (WAT)',
} as const;
