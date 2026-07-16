import './globals.css'

export const metadata = {
  title: 'Disciplinary Accountability — IL01 Aurora',
  description:
    'Technician-to-leader accountability roster for disciplinary actions, IL01 Aurora, by shift and role.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
