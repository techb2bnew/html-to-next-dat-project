import './globals.css'
import PasswordGate from '@/components/PasswordGate'

export const metadata = {
  title: 'B2B Dispatcher Academy',
}

export default function RootLayout({ children }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://b2b-bck.onrender.com';
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `window.__APP_CONFIG__ = { apiUrl: "${backendUrl}" };` }} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/challenges.css" />
        <link rel="stylesheet" href="/css/simulator.css" />
        <link rel="stylesheet" href="/css/admin.css" />
      </head>
      <body>
        <PasswordGate>
          {children}
        </PasswordGate>
      </body>
    </html>
  )
}
