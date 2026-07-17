import './globals.css'

export const metadata = {
  title: 'Disciplinary Actions Tracker — IL01 Aurora',
  description:
    'Disciplinary Actions Tracker: technician-to-leader accountability for disciplinary actions, IL01 Aurora.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
