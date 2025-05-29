"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { Loader2 } from "lucide-react"
import { RootState } from "@/redux/store"
import { setUsers, setLoading, setError } from "@/redux/features/userSlice"

interface User {
  id: string
  username: string
  email: string
  status: "ACTIVE" | "SUSPENDED" | "BANNED"
  coinBalance: number
  createdAt: string
}

export function UserTable() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { users, loading } = useSelector((state: RootState) => state.users)
  const { t } = useTranslations()

  const statusOptions = {
    "ACTIVE": "アクティブ",
    "SUSPENDED": "停止中",
    "BANNED": "禁止",
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    dispatch(setLoading(true))
    try {
      const response = await api.get('/admin/users')
      dispatch(setUsers(response.data.users))
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error(t('admin.users.messages.fetchError'))
      dispatch(setError(t('admin.users.messages.fetchError')))
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus })
      
      const updatedUsers = users.map((user) => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
      dispatch(setUsers(updatedUsers))
      toast.success(t('admin.users.messages.statusUpdateSuccess'))
    } catch (error) {
      console.error('Failed to update user status:', error)
      toast.error(t('admin.users.messages.statusUpdateError'))
    }
  }

  const handleViewDetails = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  // ユーザーが有効なステータスを持っているかチェック
  const hasValidStatus = (user: User) => {
    return user.status && ['ACTIVE', 'SUSPENDED', 'BANNED'].includes(user.status)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('admin.users.title')}</h2>
      <div className="rounded-lg max-w-[100vw]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.table.username')}</TableHead>
              <TableHead>{t('admin.users.table.email')}</TableHead>
              <TableHead>{t('admin.users.table.status')}</TableHead>
              <TableHead className="text-right">{t('admin.users.table.points')}</TableHead>
              <TableHead>{t('admin.users.table.registrationDate')}</TableHead>
              <TableHead>{t('admin.users.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {hasValidStatus(user) ? (
                    <Select
                      value={user.status}
                      onValueChange={(value) => handleStatusChange(user.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusOptions).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      未認証
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">{(user.coinBalance ?? 0).toLocaleString()}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString('ja-JP')}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(user.id)}
                  >
                    {t('admin.users.table.details')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

