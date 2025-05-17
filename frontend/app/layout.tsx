import { SiteHeader } from '@/components/layout/side-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CategoryNav } from "@/components/category-nav";
import './globals.css'
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';

// デフォルトのメタデータ設定
// export const metadata: Metadata = {
//   title: {
//     default: 'SHIJON - オンラインガチャプラットフォーム',
//     template: '%s | SHIJON'
//   },
//   description: 'SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。',
//   icons: {
//     icon: [
//       { url: '/shijon_logo.jpg', type: 'image/jpeg' },
//     ],
//     apple: '/apple-touch-icon.svg',
//   },
//   openGraph: {
//     type: 'website',
//     title: {
//       default: 'SHIJON - オンラインガチャプラットフォーム',
//       template: '%s | SHIJON'
//     },
//     description: 'SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。',
//     url: 'https://oripa-shijon.com/',
//     images: [{ url: 'https://oripa-shijon.com/card.jpg' }],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: {
//       default: 'SHIJON - オンラインガチャプラットフォーム',
//       template: '%s | SHIJON'
//     },
//     description: 'SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。',
//   }
// }
export const metadata: Metadata = {
  title: {
    default: 'SHIJON - オンラインガチャプラットフォーム',
    template: '%s | SHIJON'
  },
  description: 'SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。',
  icons: {
    icon: [
      { url: '/shijon_logo.jpg', type: 'image/jpeg' },
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
    url: 'https://oripa-shijon.com/',
    images: [
      { 
        url: 'https://oripa-shijon.com/card.jpg',
        width: 1200,
        height: 630,
        alt: 'SHIJON オンラインガチャプラットフォーム'
      }
    ],
    siteName: 'SHIJON',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'SHIJON - オンラインガチャプラットフォーム',
      template: '%s | SHIJON'
    },
    description: 'SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。',
    images: [
      {
        url: 'https://oripa-shijon.com/card.jpg',
        alt: 'SHIJON オンラインガチャプラットフォーム'
      }
    ],
   
  }
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
       <head>
        {/* 明示的にmetaタグを書く */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SHIJON - オンラインガチャプラットフォーム" />
        <meta name="twitter:description" content="SHIJONでオンラインガチャを楽しもう！レアアイテムをゲットしよう。" />
        <meta name="twitter:image" content="https://oripa-shijon.com/card.jpg" />
        <meta property="og:image" content="https://oripa-shijon.com/card.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
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
