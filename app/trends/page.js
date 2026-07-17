import { redirect } from 'next/navigation'

// Trends moved into /admin.
export default function TrendsRedirect() {
  redirect('/admin')
}
