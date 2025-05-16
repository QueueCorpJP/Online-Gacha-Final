import { SiteHeader } from '@/components/layout/side-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CategoryNav } from "@/components/category-nav";
import './globals.css'
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';

// デフォルトのメタデータ設定
export const metadata: Metadata = {
  title: {
    default: 'SHIJON - オンラインガチャプラットフォーム',
    template: '%s | SHIJON'
  },
  description: 'SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。',
  icons: {
    icon: [
      { url: '/shijon-logo.jpg', type: 'image/jpeg' },
    ],
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    type: 'website',
    title: {
      default: 'SHIJON - オンラインガチャプラットフォーム',
      template: '%s | SHIJON'
    },
    description: 'SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。',
    url: '/',
    images: [{ url: '/card.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'SHIJON - オンラインガチャプラットフォーム',
      template: '%s | SHIJON'
    },
    description: 'SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。',
  }
}

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
            <SiteHeader isAdmin={false} />
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
