"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supportApi, Inquiry, InquiryStatus } from "@/services/supportApi"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { useTranslations } from "@/hooks/use-translations"
import { api } from "@/lib/axios"
import { User } from "@/types/user"

interface InquiryWithUser extends Inquiry {
  user?: User;
}

export function InquiryTable() {
  const [inquiries, setInquiries] = useState<InquiryWithUser[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<InquiryWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { t } = useTranslations()

  useEffect(() => {
    loadInquiries()
  }, [])

  useEffect(() => {
    filterInquiries()
  }, [inquiries, statusFilter])

  const loadInquiries = async () => {
    try {
      const data = await supportApi.getInquiries()
      setInquiries(data)
      setFilteredInquiries(data)
    } catch (error) {
      toast.error(t("admin.support.inquiries.messages.loadError"))
    } finally {
      setLoading(false)
    }
  }

  const filterInquiries = () => {
    if (statusFilter === "all") {
      setFilteredInquiries(inquiries)
    } else {
      setFilteredInquiries(inquiries.filter(inquiry => inquiry.status === statusFilter))
    }
  }

  const handleStatusChange = async (id: string, status: Inquiry['status']) => {
    try {
      await supportApi.updateInquiryStatus(id, status)
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status: status as Inquiry['status'] } : inquiry
      ))
      toast.success(t("admin.support.inquiries.messages.updateSuccess"))
    } catch (error) {
      toast.error(t("admin.support.inquiries.messages.updateError"))
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("admin.support.inquiries.title")}</h2>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("admin.support.inquiries.filter.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.support.inquiries.filter.all")}</SelectItem>
            <SelectItem value="PENDING">{t("admin.support.inquiries.status.pending")}</SelectItem>
            <SelectItem value="In_PROGRESS">{t("admin.support.inquiries.status.inProgress")}</SelectItem>
            <SelectItem value="RESOLVED">{t("admin.support.inquiries.status.resolved")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="max-w-[100vw] overflow-x-auto">
        {filteredInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="mb-4 text-4xl">📬</div>
            <p className="text-lg font-medium">{t("admin.support.inquiries.noData")}</p>
            <p className="text-sm">{t("admin.support.inquiries.noDataDescription")}</p>
          </div>
        ) : (
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.support.inquiries.table.user")}</TableHead>
                <TableHead>{t("admin.support.inquiries.table.subject")}</TableHead>
                <TableHead>{t("admin.support.inquiries.table.status")}</TableHead>
                <TableHead>{t("admin.support.inquiries.table.date")}</TableHead>
                <TableHead>{t("admin.support.inquiries.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    {inquiry.user ? (
                      <div className="flex flex-col">
                        <span>{`${inquiry.user.lastName} ${inquiry.user.firstName}`}</span>
                        <span className="text-sm text-muted-foreground">{inquiry.user.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{inquiry.userId}</span>
                    )}
                  </TableCell>
                  <TableCell>{inquiry.subject.toUpperCase()}</TableCell>
                  <TableCell>{t(`admin.support.inquiries.status.${inquiry.status.toLocaleLowerCase()}`)}</TableCell>
                  <TableCell>{new Date(inquiry.createdAt).toLocaleDateString('ja-JP')}</TableCell>
                  <TableCell className="text-right">
                    <Select 
                      defaultValue={inquiry.status}
                      onValueChange={(value: Inquiry['status']) => handleStatusChange(inquiry.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">{t("admin.support.inquiries.status.pending")}</SelectItem>
                        <SelectItem value="In_PROGRESS">{t("admin.support.inquiries.status.inProgress")}</SelectItem>
                        <SelectItem value="RESOLVED">{t("admin.support.inquiries.status.resolved")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
