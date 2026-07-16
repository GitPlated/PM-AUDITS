export function NotifyBadge({ count }) {
  if (!count) return null
  return (
    <span className="notify-badge mono" role="status" aria-label={`${count} findings awaiting action`}>
      <span className="notify-badge-ring" aria-hidden="true" />
      {count}
    </span>
  )
}
