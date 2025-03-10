"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchInventoryStatus, updateItemThreshold } from "@/redux/features/inventoryStatusSlice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslations } from "@/hooks/use-translations"

export function InventoryStatus() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, error } = useSelector((state: RootState) => state.inventoryStatus)
  const [thresholds, setThresholds] = useState<Record<string, number>>({})
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  useEffect(() => {
    dispatch(fetchInventoryStatus())
  }, [dispatch])

  useEffect(() => {
    const initialThresholds = items.reduce((acc, item) => {
      acc[item.id] = item.threshold
      return acc
    }, {} as Record<string, number>)
    setThresholds(initialThresholds)
  }, [items])

  const handleThresholdChange = async (itemId: string, value: number) => {
    setThresholds(prev => ({ ...prev, [itemId]: value }))
    
    const timeoutId = setTimeout(() => {
      dispatch(updateItemThreshold({ itemId, threshold: value }))
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const getStatusDisplay = (item: typeof items[0]) => {
    if (item.status === 'LOW') {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{t("inventory.status.status.low")}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-green-500">
        <CheckCircle className="h-4 w-4" />
        <span>{t("inventory.status.status.normal")}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4 px-4 max-w-[100vw]">
        <h2 className="text-xl font-bold">{t("inventory.status.title")}</h2>
        {items.map((item) => (
          <Card key={item.id} className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t("inventory.status.mobile.itemName")}</span>
                <span>{item.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t("inventory.status.mobile.quantity")}</span>
                <span className="font-mono">{item.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t("inventory.status.mobile.percentage")}</span>
                <span className="font-mono">{item.percentage.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t("inventory.status.mobile.threshold")}</span>
                <Input
                  type="number"
                  value={thresholds[item.id] || 0}
                  onChange={(e) => handleThresholdChange(item.id, Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-20 text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t("inventory.status.mobile.status")}</span>
                {getStatusDisplay(item)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-[100vw]">
      <h2 className="text-xl font-bold">{t("inventory.status.title")}</h2>
      <div className="rounded-lg">
        <ScrollArea className="w-full" type="always">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.status.table.itemName")}</TableHead>
                  <TableHead className="text-right">{t("inventory.status.table.quantity")}</TableHead>
                  <TableHead className="text-right">{t("inventory.status.table.percentage")}</TableHead>
                  <TableHead className="text-right">{t("inventory.status.table.threshold")}</TableHead>
                  <TableHead>{t("inventory.status.table.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right font-mono">{item.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{item.percentage.toFixed(2)}%</TableCell>
                    <TableCell className="w-[200px]">
                      <Input
                        type="number"
                        value={thresholds[item.id] || 0}
                        onChange={(e) => handleThresholdChange(item.id, Number(e.target.value))}
                        min="0"
                        max="100"
                        className="w-20 text-right"
                      />
                    </TableCell>
                    <TableCell>{getStatusDisplay(item)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

