import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marathon Plan — London 2027',
  description: 'Mike Robinson · 3:10 London Marathon 2027 training and nutrition tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
