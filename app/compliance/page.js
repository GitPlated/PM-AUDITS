import { redirect } from 'next/navigation'

// The compliance tracker moved to the landing page + /leaders/[slug] + /trends
// + /submit. Keep this route so old bookmarks/links don't 404.
export default function CompliancePageRedirect() {
  redirect('/')
}
