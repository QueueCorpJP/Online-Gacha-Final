import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import { InventoryItem } from "@/redux/features/inventorySlice"
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

interface InventoryCardProps {
  item: InventoryItem;
  onExchange: (id: string) => Promise<void>;
  onShipRequest?: (id: string) => Promise<void>;
}

export function InventoryCard({ item, onExchange, onShipRequest }: InventoryCardProps) {
  const { t } = useTranslations();
  const [isExchanging, setIsExchanging] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showShipDialog, setShowShipDialog] = useState(false);

  const getRarityLabel = (rarity: number) => {
    switch (rarity) {
      case 5: return "★★★★★";
      case 4: return "★★★★";
      case 3: return "★★★";
      case 2: return "★★";
      default: return "★";
    }
  };

  const getRarityColor = (rarity: number) => {
    switch (rarity) {
      case 5: return "bg-yellow-400 text-yellow-950";
      case 4: return "bg-purple-400 text-purple-950";
      case 3: return "bg-blue-400 text-blue-950";
      case 2: return "bg-green-400 text-green-950";
      default: return "bg-gray-400 text-gray-950";
    }
  };

  const handleExchange = async () => {
    setIsExchanging(true);
    try {
      await onExchange(item.id);
    } finally {
      setIsExchanging(false);
      setShowConfirmDialog(false);
    }
  };

  const handleShipRequest = async () => {
    if (!onShipRequest) return;
    
    setIsShipping(true);
    try {
      await onShipRequest(item.id);
    } finally {
      setIsShipping(false);
      setShowShipDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <CardContent className="p-0">
          <div className="aspect-square relative">
            <img
              src={item.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}` : "/placeholder.svg"}
              alt={item.name}
              className="object-cover w-full h-full"
              loading="lazy"
            />
            <Badge 
              className={`absolute top-2 right-2 ${getRarityColor(item.rarity)}`}
            >
              {getRarityLabel(item.rarity)}
            </Badge>
            {item.status !== 'available' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="text-lg">
                  {t(`profile.inventory.status.${item.status}`)}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 p-4 w-full">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-500">
            {t("profile.inventory.obtained")}: {formatDate(item.obtainedAt)}
          </p>
          {item.status === 'available' && (
            <div className="flex flex-col w-full gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowConfirmDialog(true)}
                disabled={isExchanging}
                className="w-full"
              >
                {isExchanging ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("profile.inventory.actions.exchange")
                )}
              </Button>
              {onShipRequest && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowShipDialog(true)}
                  disabled={isShipping}
                  className="w-full"
                >
                  {isShipping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("profile.inventory.actions.ship")
                  )}
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Exchange Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.inventory.exchange.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.inventory.exchange.confirmDescription", { itemName: item.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExchanging}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExchange}
              disabled={isExchanging}
            >
              {isExchanging ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("profile.inventory.exchange.confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ship Request Confirmation Dialog */}
      <AlertDialog open={showShipDialog} onOpenChange={setShowShipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.inventory.ship.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.inventory.ship.confirmDescription", { itemName: item.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isShipping}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleShipRequest}
              disabled={isShipping}
            >
              {isShipping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("profile.inventory.ship.confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

