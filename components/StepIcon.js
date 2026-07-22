const PATHS = {
  coaching: (
    <>
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  written_warning: (
    <>
      <path d="M7 3h8l4 4v14H7Z" />
      <path d="M15 3v4h4" />
      <path d="m9.5 15.5 4.5-4.5 2 2-4.5 4.5H9.5v-2Z" />
    </>
  ),
  final_written_warning: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  termination: (
    <>
      <path d="M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8" />
      <path d="M11 12h9" />
      <path d="m16 8 4 4-4 4" />
    </>
  ),
  wording: (
    <>
      <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 9c.5-1 1.5-1 2 0s-.3 1.6-1 2" />
      <path d="M13 9c.5-1 1.5-1 2 0s-.3 1.6-1 2" />
    </>
  ),
  guide: (
    <>
      <path d="M12 6.2c-1.5-1.2-3.5-1.7-5.5-1.5C5.2 4.8 4.2 5.7 4.2 6.9v11c0 .9.8 1.5 1.7 1.4 1.8-.2 3.6.2 5 1.3M12 6.2c1.5-1.2 3.5-1.7 5.5-1.5 1.3.1 2.3 1 2.3 2.2v11c0 .9-.8 1.5-1.7 1.4-1.8-.2-3.6.2-5 1.3" />
      <path d="M12 6.2v14.6" />
    </>
  ),
  finding: (
    <>
      <path d="M7 3h8l4 4v14H7Z" />
      <path d="M15 3v4h4" />
      <path d="M12 12v6M9 15h6" />
    </>
  ),
  reactive: (
    <path d="M15.9 6.6a3.5 3.5 0 0 0-4.7 4.5L4.5 17.8l1.7 1.7 6.7-6.7a3.5 3.5 0 0 0 4.5-4.7l-2.3 2.3-2-2 2.3-2.3Z" />
  ),
}

export function StepIcon({ step, className }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {PATHS[step] ?? null}
      </svg>
    </span>
  )
}
