import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gacha/${params.id}`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    })
    const gacha = await response.json()
    
    return {
      title: `${gacha.translations.ja.name} | SHIJON`,
      description: gacha.translations.ja.description,
      openGraph: {
        title: `${gacha.translations.ja.name} | SHIJON`,
        description: gacha.translations.ja.description,
        images: [`${process.env.NEXT_PUBLIC_API_URL}${gacha.thumbnail}`],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${gacha.translations.ja.name} | SHIJON`,
        description: gacha.translations.ja.description,
        images: [`${process.env.NEXT_PUBLIC_API_URL}${gacha.thumbnail}`],
      }
    }
  } catch (error) {
    return {
      title: 'ガチャ詳細 | SHIJON',
      description: 'ガチャの詳細情報をご覧いただけます。',
      openGraph: {
        title: 'ガチャ詳細 | SHIJON',
        description: 'ガチャの詳細情報をご覧いただけます。',
      },
      twitter: {
        card: 'summary',
        title: 'ガチャ詳細 | SHIJON',
        description: 'ガチャの詳細情報をご覧いただけます。',
      }
    }
  }
}
