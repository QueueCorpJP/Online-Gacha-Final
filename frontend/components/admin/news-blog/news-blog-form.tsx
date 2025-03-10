"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UploadZone } from "@/components/ui/upload-zone"

type PostType = 'news' | 'event' | 'campaign' | 'card-info' | 'other'

export function NewsBlogForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        image: "",
        isFeatured: false,
        type: 'news' as PostType
    })
    const [preview, setPreview] = useState("")

    const postTypes = [
        { value: 'news', label: 'ニュース' },
        { value: 'event', label: 'イベント情報' },
        { value: 'campaign', label: 'キャンペーン' },
        { value: 'card-info', label: 'カード情報' },
        { value: 'other', label: 'その他' }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await api.post("/news-blog", formData)
            toast.success("投稿を作成しました")
            setFormData({ 
                title: "", 
                content: "", 
                image: "", 
                isFeatured: false,
                type: 'news'
            })
            setPreview("")
            window.dispatchEvent(new CustomEvent('newsBlogUpdated'))
            router.refresh()
        } catch (error) {
            toast.error("投稿の作成に失敗しました")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">投稿タイプ</label>
                <RadioGroup
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as PostType })}
                    className="flex flex-wrap gap-4"
                >
                    {postTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={type.value} id={type.value} />
                            <label htmlFor={type.value} className="text-sm font-medium">
                                {type.label}
                            </label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">タイトル</label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder={`${postTypes.find(t => t.value === formData.type)?.label}のタイトルを入力`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">内容</label>
                <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={6}
                    placeholder="投稿内容を入力してください"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">画像</label>
                <UploadZone
                    onFileSelect={(file) => {
                        if (file) {
                            const formData = new FormData();
                            formData.append('image', file);
                            
                            api.post('news-blog/uploads', formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            })
                                .then(response => {
                                    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${response.data.url}`;
                                    setFormData(prev => ({
                                        ...prev,
                                        image: imageUrl
                                    }));
                                    setPreview(imageUrl)
                                })
                                .catch(() => {
                                    toast.error("画像のアップロードに失敗しました");
                                });
                        }
                    }}
                    maxSize={5 * 1024 * 1024}
                    accept={{
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'image/png': ['.png']
                    }}
                    defaultPreview={preview || formData.image}
                    className="bg-white"
                />
                <div className="text-xs text-gray-500 space-y-1">
                    <p>推奨サイズ: 1200x630px</p>
                    <p>最大ファイルサイズ: 5MB</p>
                    <p>対応フォーマット: JPG, PNG</p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => 
                        setFormData({ ...formData, isFeatured: checked as boolean })
                    }
                />
                <label htmlFor="featured" className="text-sm font-medium">
                    注目記事として表示
                </label>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? "投稿中..." : "投稿する"}
            </Button>
        </form>
    )
}
