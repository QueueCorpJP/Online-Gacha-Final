"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchAdminGachas, selectGacha } from "@/redux/features/gachaSlice"

interface GachaTableProps {
  onEdit?: (id: string) => void;
}

export function GachaTable({ onEdit }: GachaTableProps) {
  const { t } = useTranslations()
  const dispatch = useDispatch()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  
  const { gachas, loading, error, total } = useSelector((state: RootState) => state.gacha)
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    dispatch(fetchAdminGachas({ page, limit }))
  }, [dispatch, page, limit])

  const handleEdit = (id: string) => {
    // Find the selected gacha from the gachas array
    const selectedGacha = gachas.find(gacha => gacha.id === id);
    
    if (selectedGacha) {
      // Dispatch the selectGacha action to store the current gacha data
      dispatch(selectGacha(selectedGacha));
    }

    // Navigate based on whether onEdit prop exists
    if (onEdit) {
      onEdit(id);
    } else {
      // router.push(`/admin/gacha/${id}/edit`);
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">{t("admin.gachaTable.headers.thumbnail")}</TableHead>
            <TableHead>{t("admin.gachaTable.headers.name")}</TableHead>
            <TableHead>{t("admin.gachaTable.headers.type")}</TableHead>
            <TableHead>{t("admin.gachaTable.headers.price")}</TableHead>
            <TableHead>{t("admin.gachaTable.headers.period")}</TableHead>
            <TableHead>{t("admin.gachaTable.headers.status")}</TableHead>
            <TableHead className="text-right">{t("admin.gachaTable.headers.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gachas.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                  <Image 
                    src={item.thumbnail ? `${process.env.NEXT_PUBLIC_API_URL}${item.thumbnail}` : "/placeholder.svg"} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{item.translations.ja.name}</TableCell>
              <TableCell>{t(`admin.gachaTable.types.${item.type}`)}</TableCell>
              <TableCell>{item.price} {t("admin.gachaTable.points")}</TableCell>
              <TableCell>
                {item.duration 
                  ? t("admin.gachaTable.period.days", { days: item.duration })
                  : t("admin.gachaTable.period.unlimited")}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "text-sm", 
                  item.isActive ? "text-green-600" : "text-gray-500"
                )}>
                  {t(item.isActive 
                    ? "admin.gachaTable.status.active" 
                    : "admin.gachaTable.status.inactive")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit(item.id)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">
                    {t("admin.gachaTable.edit")} {item.name}
                  </span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-center px-2 py-4">
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={page === 1 || loading}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages || loading}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

