"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"

interface NewsBlog {
    id: string
    title: string
    content: string
    image?: string
    isFeatured: boolean
    createdAt: string
}

export default function NewsBlogDetailPage() {
    const params = useParams()
    const [post, setPost] = useState<NewsBlog | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPost()
    }, [params.id])

    const loadPost = async () => {
        try {
            const response = await api.get(`/news-blog/${params.id}`)
            setPost(response.data)
            console.log("Loaded post:", response.data) // デバッグ用
        } catch (error) {
            console.error("Failed to load post:", error)
        } finally {
            setLoading(false)
        }
    }

    // 画像URLを正しく生成する関数
    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return '/placeholder.svg'
        
        // すでに完全なURLの場合はそのまま返す
        if (imagePath.startsWith('http')) return imagePath
        
        // 相対パスの場合はAPI_URLと結合
        const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`
        console.log("Generated image URL:", fullUrl) // デバッグ用
        return fullUrl
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center text-gray-500">
                    投稿が見つかりませんでした
                </div>
            </div>
        )
    }

    // NEXT_PUBLIC_API_URLの値をコンソールに出力（デバッグ用）
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)

    return (
        <div className="container mx-auto py-8 px-4">
            <article className="max-w-3xl mx-auto">
                {post.image && (
                    <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden">
                        <Image
                            src={getImageUrl(post.image)}
                            alt={post.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                                console.error("Image load error:", e);
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                            unoptimized
                        />
                    </div>
                )}
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <div className="text-gray-500 mb-8">
                    {format(new Date(post.createdAt), "yyyy年MM月dd日")}
                </div>
                <div className="prose max-w-none">
                    {post.content}
                </div>
            </article>
        </div>
    )
}