'use client'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

// Since this is a Server Component, we need to make a Client Component wrapper



import { SiteHeader } from '@/components/layout/side-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CategoryNav } from "@/components/category-nav";
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { usePathname } from 'next/navigation'

function Header() {
  const pathname = usePathname()
//a
  const isAdminRoute = pathname?.startsWith('/admin')
  const isAdmin = isAdminRoute
  
  return <SiteHeader isAdmin={isAdmin} />
}

// export const metadata: Metadata = {
//   title: 'Gacha app',
//   description: 'Created @2025',
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <Toaster />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <CategoryNav />
            <div className="flex flex-1">
              {/* <SiteSidebar className="hidden lg:block" /> */}
              <main className="flex-1 max-w-[100vw]">{children}</main>
            </div>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
