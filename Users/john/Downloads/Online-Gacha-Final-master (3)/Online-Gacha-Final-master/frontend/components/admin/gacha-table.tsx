"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchAdminGachas, selectGacha, deleteGacha } from "@/redux/features/gachaSlice"
import { useIsMobile } from "@/hooks/use-mobile"

interface GachaTableProps {
  onEdit?: (id: string) => void;
}

export function GachaTable({ onEdit }: GachaTableProps) {
  const { t } = useTranslations()
  const dispatch = useDispatch()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const isMobile = useIsMobile()
  
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

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteGacha(deleteId)).unwrap();
      toast({
        title: t("admin.gachaTable.deleteSuccess"),
        description: t("admin.gachaTable.deleteSuccessDescription"),
      });
      // Refresh the gacha list
      dispatch(fetchAdminGachas({ page, limit }));
    } catch (error) {
      toast({
        title: t("admin.gachaTable.deleteError"),
        description: typeof error === 'string' ? error : t("admin.gachaTable.deleteErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
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

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {gachas.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                <Image 
                  src={item.thumbnail ? `${process.env.NEXT_PUBLIC_API_URL}${item.thumbnail}` : "/placeholder.svg"} 
                  alt={item.name} 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{item.translations.ja.name}</h3>
                <p className="text-xs text-gray-500">{t(`admin.gachaTable.types.${item.type}`)}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEdit(item.id)}
                className="flex-shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">{t("admin.gachaTable.headers.price")}</span>
                <p className="font-medium">{item.price} {t("admin.gachaTable.points")}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">{t("admin.gachaTable.headers.period")}</span>
                <p className="font-medium">
                  {item.duration 
                    ? t("admin.gachaTable.period.days", { days: item.duration })
                    : t("admin.gachaTable.period.unlimited")}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded col-span-2">
                <span className="text-gray-500">{t("admin.gachaTable.headers.status")}</span>
                <span className={cn(
                  "ml-2 text-xs font-medium px-2 py-0.5 rounded-full", 
                  item.isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                )}>
                  {t(item.isActive 
                    ? "admin.gachaTable.status.active" 
                    : "admin.gachaTable.status.inactive")}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Mobile pagination */}
        <div className="flex items-center justify-between px-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="w-24"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("common.previous")}
          </Button>
          
          <span className="text-xs text-center">
            {t("common.page")} {page}/{totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="w-24"
          >
            {t("common.next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  // Desktop table view
  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.gachaTable.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.gachaTable.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {t("admin.gachaTable.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-lg">
        <div className="overflow-x-auto">
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
                        className="object-contain" 
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
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", 
                      item.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">
                        {t("admin.gachaTable.delete")} {item.name}
                      </span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
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
              {t("common.page")} {page} / {totalPages}
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
    </>
  )
}

