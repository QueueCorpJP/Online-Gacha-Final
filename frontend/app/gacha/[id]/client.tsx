"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { GachaImage } from "@/components/product/gacha-image"
import { GachaHeader } from "@/components/product/gacha-header"
import { GachaPurchaseOptions } from "@/components/product/purchase-options"
import { GachaDetails } from "@/components/product/gacha-details"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchGachaById, clearCurrentGacha, selectGacha } from "@/redux/features/gachaSlice"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"

// export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gacha/${params.id}`)
//     const gacha = await response.json()
    
//     return {
//       title: `${gacha.translations.ja.name} | SHIJON`,
//       description: gacha.translations.ja.description,
//       openGraph: {
//         title: `${gacha.translations.ja.name} | SHIJON`,
//         description: gacha.translations.ja.description,
//         images: [`${process.env.NEXT_PUBLIC_API_URL}${gacha.thumbnail}`],
//       },
//     }
//   } catch (error) {
//     return {
//       title: 'ガチャ詳細 | SHIJON',
//       description: 'ガチャの詳細情報をご覧いただけます。',
//     }
//   }
// }

export default function GachaDetailPage() {
    const { t, language } = useTranslations()
    const params = useParams()
    const { toast } = useToast()
    const dispatch = useDispatch<AppDispatch>()
    const { currentGacha: gacha, loading, error } = useSelector((state: RootState) => state.gacha)

    useEffect(() => {
        if (params.id) {
            dispatch(fetchGachaById(params.id as string))
                .unwrap()
                .then((response) => {
                    dispatch(selectGacha(response))
                })
                .catch((error) => {
                    console.log(error);
                    toast({
                        title: t("gacha.error.pull.title"),
                        description: error,
                        variant: "destructive",
                    })
                })
        }

        return () => {
            dispatch(clearCurrentGacha())
        }
    }, [params.id, dispatch])

    const purchaseOptions = [
        ...(gacha?.isOneTimeFreeEnabled ? [
            { 
                type: t("gacha.purchase.options.trial"), 
                price: t("gacha.purchase.options.free"), 
                isFree: true,
                times: 1
            }
        ] : []),
        { type: t("gacha.purchase.options.once"), price: Number(gacha?.price) || 9200, times: 1 },
        { 
            type: t("gacha.purchase.options.tenTimes"), 
            price: (Number(gacha?.price) || 9200) * 9,
            discount: t("gacha.purchase.options.discount.ten"),
            times: 10
        },
        { 
            type: t("gacha.purchase.options.hundredTimes"), 
            price: (Number(gacha?.price) || 9200) * 80,
            discount: t("gacha.purchase.options.discount.twenty"),
            times: 100
        },
    ]

    const productDetails = [
        { 
            title: t("gacha.purchase.details.content.title"), 
            content: gacha?.items?.map(item => `${item.name} (${item.rarity.toUpperCase()})`).join(", ") || 
                     t("gacha.purchase.details.content.description"), 
            isPurple: true 
        },
        { 
            title: t("gacha.purchase.details.rarity.title"), 
            content: gacha?.items?.map(item => `${item.rarity.toUpperCase()}: ${parseInt(item.probability)}%`).join("\n") || 
                     t("gacha.purchase.details.rarity.description"), 
            isPurple: true 
        },
        { 
            title: t("gacha.purchase.details.period.title"), 
            content: gacha?.period ? (() => {
                const createdAt = new Date(gacha.createdAt);
                const endDate = new Date(createdAt.getTime() + (gacha.period * 24 * 60 * 60 * 1000));
                return `${createdAt.toLocaleDateString('ja-JP')} 〜 ${endDate.toLocaleDateString('ja-JP')}`;
            })() : t("gacha.purchase.details.period.description"),
            isPurple: true 
        },
        { 
            title: t("gacha.purchase.details.notice.title"), 
            content: t("gacha.purchase.details.notice.description"), 
            isPurple: true 
        },
    ]

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        )
    }

    if (error || !gacha) {
        return <div className="container mx-auto px-4 py-8">
            {error || t("gacha.error.not_found")}
        </div>
    }

    // 言語設定に応じたガチャ情報を取得
    const gachaTitle = gacha.translations?.[language]?.name || gacha.name;
    const gachaDescription = gacha.translations?.[language]?.description || gacha.description;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-2">
                <GachaImage
                    src={gacha.thumbnail || "/placeholder.svg"}
                    alt={gachaTitle}
                    className="w-full h-48 md:h-96 rounded-lg"
                />
                <div className="space-y-6">
                    <GachaHeader
                        category={gacha.category?.name || t("gacha.purchase.category.limited")}
                        title={gachaTitle}
                        
                        reviews={(gacha.likes || 0) + (gacha.dislikes || 0)}
                        likes={gacha.likes || 0}
                        dislikes={gacha.dislikes || 0}
                        gachaId={params.id as string}
                    />
                    <GachaPurchaseOptions 
                        options={purchaseOptions} 
                        gachaId={params.id as string}
                    />
                </div>
            </div>
            <GachaDetails
                description={gachaDescription}
                details={productDetails}
                items={gacha.items}
            />
        </div>
    )
}
