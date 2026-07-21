/**
 * Format an ISO timestamp as a quiet newsprint dateline, e.g. "July 21, 2026".
 * Empty/invalid input renders as an em dash so drafts read cleanly.
 */
export function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
