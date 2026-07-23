// Next.js instrumentation hook — register() runs once when the Node server boots.
//
// Why this exists: the daily Google Sheets sync used to be driven by a GitHub
// Actions cron, which GitHub auto-disabled after 60 days of repo inactivity.
// The dashboard then served stale numbers for ~11 weeks unnoticed. Running the
// schedule from inside the always-on Railway process can't be disabled that way.
// The GitHub Actions workflow is kept as a redundant backup trigger.

export async function register(): Promise<void> {
  // Only run in the Node.js server runtime (not edge / browser bundles).
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const port = process.env.PORT || '3000'
  const syncUrl = `http://127.0.0.1:${port}/api/sync`
  const DAY_MS = 24 * 60 * 60 * 1000

  const runSync = async (): Promise<void> => {
    try {
      const res = await fetch(syncUrl, { method: 'POST' })
      console.info(`[sync-scheduler] POST /api/sync -> ${res.status} at ${new Date().toISOString()}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[sync-scheduler] sync failed: ${message}`)
    }
  }

  // register() runs before the HTTP server is listening, so delay the first run
  // to let the server come up, then repeat once per day.
  setTimeout(() => {
    void runSync()
    setInterval(() => {
      void runSync()
    }, DAY_MS)
  }, 60_000)
}
