import { JetBrains_Mono } from 'next/font/google'

const jetbrains_mono = JetBrains_Mono({ subsets: ['latin'] })

export const metadata = {
  title: 'couchbox',
  description: 'Created by hacker-noobz',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={jetbrains_mono.className}>{children}</body>
    </html>
  )
}
