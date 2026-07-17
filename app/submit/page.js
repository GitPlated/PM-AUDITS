import { redirect } from 'next/navigation'

// Submit a finding moved into /admin.
export default function SubmitRedirect() {
  redirect('/admin')
}
