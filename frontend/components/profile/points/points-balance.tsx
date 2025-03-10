"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import { fetchPointsBalance, purchasePoints } from "@/redux/features/pointsSlice";
import { RootState } from "@/redux/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PaymentMethodDialog } from "@/components/payment-method-dialog";

interface PointsBalanceProps {
  points: number;
}

export function PointsBalance({ points: initialPoints }: PointsBalanceProps) {
  const { t } = useTranslations();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);

  const { user, isLoading: loading, error } = useSelector((state: RootState) => state.auth)

  // const handlePurchase = async () => {
  //   if (!purchaseAmount || isNaN(Number(purchaseAmount))) {
  //     toast({
  //       title: t("common.error"),
  //       description: t("profile.points.balance.invalidAmount"),
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     await dispatch(purchasePoints({
  //       amount: Number(purchaseAmount),
  //       paymentMethodId: "default" // You might want to add payment method selection
  //     })).unwrap();

  //     toast({
  //       title: t("profile.points.balance.purchaseSuccess"),
  //       description: t("profile.points.balance.purchaseSuccessDetail", {
  //         amount: purchaseAmount
  //       }),
  //     });

  //     setIsDialogOpen(false);
  //     setPurchaseAmount("");
  //     dispatch(fetchPointsBalance());
  //   } catch (error) {
  //     toast({
  //       title: t("common.error"),
  //       description: error instanceof Error ? error.message : t("profile.points.balance.purchaseError"),
  //       variant: "destructive",
  //     });
  //   }
  // };

  // const handlePurchaseClick = () => {
  //   if (!purchaseAmount || isNaN(Number(purchaseAmount))) {
  //     toast({
  //       title: t("common.error"),
  //       description: t("profile.points.balance.invalidAmount"),
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   setIsDialogOpen(false);
  //   setIsPaymentMethodDialogOpen(true);
  // };

  const handlePaymentMethodDialogChange = (open: boolean) => {
    setIsPaymentMethodDialogOpen(open);
    // if (!open) {
    //   handlePurchase();
    // }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t("profile.points.balance.title")}</h2>
      <div className="flex items-end gap-4">
        <div className="text-4xl font-bold text-[#7C3AED]">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {user?.coinBalance.toLocaleString()} <span className="text-2xl">{t("profile.points.balance.unit")}</span>
            </>
          )}
        </div>
      </div>
      <Button 
            className="bg-black hover:bg-gray-800"
            onClick={() => setIsPaymentMethodDialogOpen(true)}
          >
            {t("profile.points.balance.purchase")}
          </Button>
      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          
        </DialogTrigger>
        <DialogContent> */}
          {/* <DialogHeader>
            <DialogTitle>{t("profile.points.balance.purchaseTitle")}</DialogTitle>
          </DialogHeader> */}
          {/* <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t("profile.points.balance.enterAmount")}
              </label>
              <Input
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                placeholder="1000"
                min="100"
                step="100"
              />
            </div>
            <Button
              className="w-full bg-black hover:bg-gray-800"
              onClick={handlePurchaseClick}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                t("profile.points.balance.confirmPurchase")
              )}
            </Button>
          </div> */}
        {/* </DialogContent>
      </Dialog> */}

      <PaymentMethodDialog 
        open={isPaymentMethodDialogOpen}
        onOpenChange={handlePaymentMethodDialogChange}
      />
    </div>
  );
}
