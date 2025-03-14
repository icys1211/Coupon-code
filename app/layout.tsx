import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Coupon System',
  description: 'The best place to find coupons',
  icons: {
    icon: '/app/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
