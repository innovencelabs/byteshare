import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
  
export const metadata: Metadata = {
  title: {
    default: 'ByteShare',
    template: '%s - ByteShare'
  },
  description:
    'Generate shareable links & QR codes instantly. Seamless file sharing for documents, photos, & more. Secure & user-friendly. Sign up free!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`bg-darkbg {inter.className}`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
