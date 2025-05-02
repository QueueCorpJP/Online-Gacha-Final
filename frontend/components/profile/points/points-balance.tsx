"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import { RootState } from "@/redux/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PaymentMethodDialog } from "@/components/payment-method-dialog";
import { fetchProfile } from "@/redux/features/profileSlice";

interface PointsBalanceProps {
  points?: number; // オプショナルに変更
}

export function PointsBalance({ points }: PointsBalanceProps) {
  const { t } = useTranslations();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);

  const { user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const { data: profileData, loading: profileLoading } = useSelector((state: RootState) => state.profile);
  
  const loading = authLoading || profileLoading;
  
  useEffect(() => {
    // コンポーネントマウント時にプロファイル情報を取得
    dispatch(fetchProfile());
  }, [dispatch]);

  const handlePaymentMethodDialogChange = (open: boolean) => {
    setIsPaymentMethodDialogOpen(open);
  };

  // コインバランスを取得 (authのuser、profileのdataの順で確認)
  const coinBalance = user?.coinBalance || profileData?.coinBalance || 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t("profile.points.balance.title")}</h2>
      <div className="flex items-end gap-4">
        <div className="text-4xl font-bold text-[#7C3AED]">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {coinBalance.toLocaleString()} <span className="text-2xl">{t("profile.points.balance.unit")}</span>
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

      <PaymentMethodDialog 
        open={isPaymentMethodDialogOpen}
        onOpenChange={handlePaymentMethodDialogChange}
      />
    </div>
  );
}
