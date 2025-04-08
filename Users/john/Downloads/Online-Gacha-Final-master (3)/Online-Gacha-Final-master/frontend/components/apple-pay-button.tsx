import { buttonVariants } from "@/components/ui/button";
import { cn, hasApplePay } from "@/lib/utils";
import { Icons } from "@/components/icons";
import Link from "next/link";

export const ApplePayButton = () =>
(
    <Link
      href="https://buy.stripe.com/00g7vD4Vu8zQb8k5kl?prefilled_promo_code=EARLYBIRD"
      target="_blank"
      className={cn(
        buttonVariants({ variant: "default", size: "lg" }),
        "w-full gap-1 text-xl",
      )}
    >
      <Icons.apple className="ml-2 h-5 w-5" />
      <p>Pay</p>
    </Link>
  );