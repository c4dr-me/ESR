import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from "sonner";
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
export const metadata: Metadata = {
  title: 'Email Spam Report',
  description: 'Test email deliverability across popular providers, generate shareable reports, and inspect inbox vs. spam placement.',
  keywords: ['email', 'spam', 'deliverability', 'report', 'gmail', 'outlook'],
  authors: [{ name: 'Email Spam Report', url: 'https://github.com/c4dr-me/ESR' }],
  generator: 'email-spam-report',
    icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
