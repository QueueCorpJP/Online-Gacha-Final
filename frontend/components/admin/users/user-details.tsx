"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/hooks/use-translations"
import { Loader2, ArrowLeft } from "lucide-react"

interface UserDetails {
  id: string
  username: string
  email: string
  status: "Active" | "Suspended" | "Banned"
  coinBalance: number
  createdAt: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
}

interface Transaction {
  id: string
  amount: number
  type: string
  createdAt: string
  description: string
}

interface Payment {
  id: string
  amount: number
  status: string
  createdAt: string
  method: string
}

export function UserDetails() {
  const router = useRouter()
  const params = useParams()
  const { t } = useTranslations()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserDetails | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    if (params.id) {
      fetchUserDetails()
      fetchTransactions()
      fetchPayments()
    }
  }, [params.id])

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/admin/users/${params.id}`)
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      toast.error(t('admin.users.messages.fetchDetailsError'))
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await api.get(`/admin/users/${params.id}/transactions`)
      setTransactions(response.data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await api.get(`/admin/users/${params.id}/payments`)
      setPayments(response.data)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t('admin.users.details.title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.details.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('admin.users.details.username')}
              </label>
              <p>{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('admin.users.details.email')}
              </label>
              <p>{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('admin.users.details.status')}
              </label>
              <p>{user.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('admin.users.details.coinBalance')}
              </label>
              <p>{user.coinBalance.toLocaleString()}</p>
            </div>
            {user.firstName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('admin.users.details.name')}
                </label>
                <p>{`${user.firstName} ${user.lastName}`}</p>
              </div>
            )}
            {user.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('admin.users.details.phone')}
                </label>
                <p>{user.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

     
    </div>
  )
}