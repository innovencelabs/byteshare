import type { Metadata } from 'next'
import { Work_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const work_Sans = Work_Sans({ subsets: ['latin'] })
  
export const metadata: Metadata = {
  title: 'ByteShare',
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
      <body className={work_Sans.className}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
