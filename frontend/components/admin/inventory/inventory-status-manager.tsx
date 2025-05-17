"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/axios"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react"

interface InventoryStatus {
  id: string
  itemName: string
  currentStatus: 'available' | 'exchanged' | 'shipped' | 'shipping'
  updatedAt: string
  obtainedAt: string
  userEmail: string
}

export function InventoryStatusManager() {
  const [statuses, setStatuses] = useState<InventoryStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [emailFilter, setEmailFilter] = useState<string>('')
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const fetchStatuses = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await api.get('/inventory/status/shipping', {
        params: {
          page,
          limit: itemsPerPage,
          status: statusFilter === 'all' ? undefined : statusFilter,
          email: emailFilter || undefined
        }
      })

      console.log(response.data);
      setStatuses(response.data.items)
      setTotalPages(Math.ceil(response.data.total / itemsPerPage))
      setCurrentPage(page)
    } catch (error) {
      toast({
        title: "エラー",
        description: "ステータス情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatuses(currentPage)
  }, [statusFilter, emailFilter, currentPage]) // Add currentPage to dependencies

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/inventory/status/${id}`, {
        status: newStatus
      })
      toast({
        title: "成功",
        description: "ステータスを更新しました",
      })
      fetchStatuses(currentPage)
    } catch (error) {
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchStatuses(page)  // Add this line to fetch data for the new page
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">在庫ステータス管理</h2>
        <div className="flex gap-4">
          <Input
            placeholder="メールアドレスで検索"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="w-[250px]"
          />
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータスでフィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="available">利用可能</SelectItem>
              <SelectItem value="shipping">発送中</SelectItem>
              <SelectItem value="shipped">発送済み</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => fetchStatuses(currentPage)} 
            disabled={loading}
            className="relative"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                読み込み中...
              </>
            ) : (
              "更新"
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>アイテム名</TableHead>
              <TableHead>ユーザーメール</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>取得日時</TableHead>
              <TableHead>更新日時</TableHead>
              <TableHead>アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((status) => (
              <TableRow key={status.id}>
                <TableCell>{status.itemName}</TableCell>
                <TableCell>{status.userEmail}</TableCell>
                <TableCell>{status.currentStatus}</TableCell>
                <TableCell>{formatDate(status.obtainedAt)}</TableCell>
                <TableCell>{formatDate(status.updatedAt)}</TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) => updateStatus(status.id, value)}
                    defaultValue={status.currentStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">利用可能</SelectItem>
                      <SelectItem value="exchanged">交換済み</SelectItem>
                      <SelectItem value="shipped">発送済み</SelectItem>
                      <SelectItem value="shipping">発送中</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          ページ {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
