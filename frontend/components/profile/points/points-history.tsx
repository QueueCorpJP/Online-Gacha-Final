"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "@/hooks/use-translations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchTransactionHistory } from "@/redux/features/pointsSlice";
import { RootState, AppDispatch } from "@/redux/store";
import { Loader2 } from "lucide-react";
import { translations } from "@/locales/translations";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? K | `${K}.${NestedKeyOf<T[K]>}` : never }[keyof T]
  : never;

const descriptionMap: Record<string, NestedKeyOf<typeof translations.en>> = {
  usage: "profile.points.history.items.gacha" as const,
  purchase: "profile.points.history.items.purchase" as const,
};

export function PointsHistory() {
  const { t } = useTranslations();
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);
  const { transactionHistory, totalPages, historyLoading, error } = useSelector((state: RootState) => state.points);

  useEffect(() => {
    dispatch(fetchTransactionHistory(currentPage));
  }, [dispatch, currentPage]);

  if (historyLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t("profile.points.history.title")}</h2>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("profile.points.history.table.date")}</TableHead>
              <TableHead>{t("profile.points.history.table.description")}</TableHead>
              <TableHead className="text-right">{t("profile.points.history.table.points")}</TableHead>
              <TableHead className="text-right">{t("profile.points.history.table.balance")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono">
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {t(descriptionMap[item.type] ?? "profile.points.history.items.unknown")}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-mono ${item.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {item.amount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">{item.balance.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {transactionHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  {t("profile.points.history.noTransactions")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {/* Show current page number */}
              <PaginationItem>
                <PaginationLink isActive>
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
