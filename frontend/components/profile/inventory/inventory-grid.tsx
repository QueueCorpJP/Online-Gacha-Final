"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCcw } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch } from "@/redux/store"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InventoryCard } from "./inventory-card"
import { RootState } from "@/redux/store"
import { fetchInventory, exchangeForPoints, setFilter } from "@/redux/features/inventorySlice"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { api } from "@/lib/axios"

export function InventoryGrid() {
  const { t } = useTranslations();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, filter } = useSelector((state: RootState) => ({
    items: state.inventory.items.map(item => ({
      ...item,
      name: item.name || 'Unknown Item',
      imageUrl: item.imageUrl
    })),
    loading: state.inventory.loading,
    error: state.inventory.error,
    filter: state.inventory.filter
  }));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadInventoryData = async () => {
    try {
      await dispatch(fetchInventory(filter)).unwrap();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("profile.inventory.fetchError"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [dispatch, filter]);

  const handleFilterChange = (value: string) => {
    dispatch(setFilter(value));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadInventoryData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExchange = async (itemId: string) => {
    try {
      await dispatch(exchangeForPoints(itemId)).unwrap();
      toast({
        title: t("profile.inventory.exchangeSuccess"),
        variant: "default",
      });
      // Refresh inventory after successful exchange
      loadInventoryData();
    } catch (error) {
      toast({
        title: t("profile.inventory.exchangeError"),
        variant: "destructive",
      });
    }
  };

  const handleShipRequest = async (itemId: string) => {
    try {
      const response = await api.post(`/inventory/${itemId}/ship`);
      toast({
        title: t("profile.inventory.shipSuccess"),
        description: response.data.message || t("profile.inventory.shipSuccessDescription"),
        variant: "default",
      });
      // Refresh inventory after successful shipping request
      loadInventoryData();
    } catch (error: any) {
      toast({
        title: t("profile.inventory.shipError"),
        description: error.response?.data?.message || t("profile.inventory.shipErrorDescription"),
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="text-center text-red-500">
          {error}
        </div>
        <Button onClick={loadInventoryData} variant="outline">
          {t("common.actions.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("profile.inventory.filter.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("profile.inventory.filter.all")}</SelectItem>
            <SelectItem value="super_rare">{t("profile.inventory.filter.super_rare")}</SelectItem>
            <SelectItem value="rare">{t("profile.inventory.filter.rare")}</SelectItem>
            <SelectItem value="normal">{t("profile.inventory.filter.normal")}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t("profile.inventory.refresh")}
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="mb-4 text-4xl">📦</div>
          <p className="text-lg font-medium">{t("profile.inventory.noItems")}</p>
          <p className="text-sm">{t("profile.inventory.noItemsDescription")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onExchange={handleExchange}
              onShipRequest={handleShipRequest}
            />
          ))}
        </div>
      )}
    </div>
  )
}
