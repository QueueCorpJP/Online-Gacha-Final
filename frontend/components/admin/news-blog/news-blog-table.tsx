"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { Loader2, Search } from "lucide-react"

interface NewsBlog {
    id: string
    title: string
    content: string
    image?: string
    type: string
    isFeatured: boolean
    createdAt: string
}

interface Filters {
    search: string;
    type: string;
    featured: boolean;
}

const typeOptions = [
    { value: "all", label: "全て" },
    { value: "news", label: "ニュース" },
    { value: "event", label: "イベント情報" },
    { value: "campaign", label: "キャンペーン" },
    { value: "card-info", label: "カード情報" },
    { value: "other", label: "その他" },
];

export function NewsBlogTable() {
    const [posts, setPosts] = useState<NewsBlog[]>([])
    const [filteredPosts, setFilteredPosts] = useState<NewsBlog[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
    const [filters, setFilters] = useState<Filters>({
        search: "",
        type: "all",
        featured: false
    })

    useEffect(() => {
        loadPosts()
        
        const handleUpdate = () => loadPosts()
        window.addEventListener('newsBlogUpdated', handleUpdate)
        
        return () => {
            window.removeEventListener('newsBlogUpdated', handleUpdate)
        }
    }, [])

    useEffect(() => {
        filterPosts()
    }, [posts, filters])

    const filterPosts = () => {
        let result = [...posts]

        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            result = result.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm)
            )
        }

        // Apply type filter
        if (filters.type !== "all") {
            result = result.filter(post => post.type === filters.type)
        }

        // Apply featured filter
        if (filters.featured) {
            result = result.filter(post => post.isFeatured)
        }

        setFilteredPosts(result)
    }

    const loadPosts = async () => {
        try {
            const response = await api.get("/news-blog")
            setPosts(response.data)
            setFilteredPosts(response.data)
        } catch (error) {
            toast.error("投稿の読み込みに失敗しました")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/news-blog/${id}`)
            toast.success("投稿を削除しました")
            loadPosts()
            setDeleteDialogOpen(false)
        } catch (error) {
            toast.error("投稿の削除に失敗しました")
        }
    }

    const handleFeaturedChange = async (id: string, isFeatured: boolean) => {
        try {
            await api.put(`/news-blog/${id}`, { isFeatured })
            toast.success("投稿を更新しました")
            loadPosts()
        } catch (error) {
            toast.error("投稿の更新に失敗しました")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="タイトルまたは内容で検索"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="flex-1"
                        />
                        <Button variant="secondary">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                    <Select
                        value={filters.type}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="カテゴリ選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="featured"
                            checked={filters.featured}
                            onCheckedChange={(checked) => 
                                setFilters(prev => ({ ...prev, featured: checked as boolean }))
                            }
                        />
                        <label htmlFor="featured">注目記事のみ表示</label>
                    </div>
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="mb-4 text-4xl">📝</div>
                    <p className="text-lg font-medium">投稿がありません</p>
                    <p className="text-sm">新しい投稿を作成してください</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>タイトル</TableHead>
                            <TableHead>カテゴリ</TableHead>
                            <TableHead>作成日</TableHead>
                            <TableHead>注目記事</TableHead>
                            <TableHead>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPosts.map((post) => (
                            <TableRow key={post.id}>
                                <TableCell>{post.title}</TableCell>
                                <TableCell>
                                    {(() => {
                                        const typeMap = {
                                            'news': 'ニュース',
                                            'event': 'イベント情報',
                                            'campaign': 'キャンペーン',
                                            'card-info': 'カード情報',
                                            'other': 'その他'
                                        };
                                        return typeMap[post.type as keyof typeof typeMap] || post.type;
                                    })()}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(post.createdAt), "yyyy/MM/dd HH:mm")}
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={post.isFeatured}
                                        onCheckedChange={(checked) => 
                                            handleFeaturedChange(post.id, checked as boolean)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPostId(post.id)
                                            setDeleteDialogOpen(true)
                                        }}
                                    >
                                        削除
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>投稿の削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            この投稿を削除してもよろしいですか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedPostId && handleDelete(selectedPostId)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            削除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
