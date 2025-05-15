"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface NewsBlog {
    id: string
    title: string
    content: string
    image?: string
    isFeatured: boolean
    createdAt: string
}

export default function NewsBlogPage() {
    const [posts, setPosts] = useState<NewsBlog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPosts()
    }, [])

    const loadPosts = async () => {
        try {
            const response = await api.get("/news-blog")
            setPosts(response.data)
            // レスポンスデータをコンソールに出力（デバッグ用）
            console.log("Loaded posts:", response.data)
        } catch (error) {
            console.error("Failed to load posts:", error)
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

    // NEXT_PUBLIC_API_URLの値をコンソールに出力（デバッグ用）
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">ニュース & ブログ</h1>
            
            {/* Featured Posts */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">注目の記事</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.filter(post => post.isFeatured).map((post) => (
                        <Link 
                            key={post.id} 
                            href={`/news-blog/${post.id}`}
                            className="group"
                        >
                            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-[1.02]">
                                {post.image && (
                                    <div className="relative h-48 w-full">
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
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(post.createdAt), "yyyy年MM月dd日")}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* All Posts */}
            <div>
                <h2 className="text-2xl font-semibold mb-6">最新の投稿</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link 
                            key={post.id} 
                            href={`/news-blog/${post.id}`}
                            className="group"
                        >
                            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-[1.02]">
                                {post.image && (
                                    <div className="relative h-48 w-full">
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
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(post.createdAt), "yyyy年MM月dd日")}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}