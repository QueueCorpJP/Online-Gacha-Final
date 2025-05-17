"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { fetchSecurityLogs } from "@/redux/features/securityLogSlice"
import { RootState } from "@/redux/store"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export function SecurityLogs() {
  const dispatch = useDispatch()
  const { logs, pagination, loading, error } = useSelector((state: RootState) => state.securityLogs)
  const [currentPage, setCurrentPage] = useState(pagination.page)
  const itemsPerPage = pagination.limit

  // ログメッセージを日本語に翻訳する関数
  const translateLogDetails = (details: string | undefined) => {
    if (!details) return '-';
    
    // ログイン成功メッセージを翻訳
    if (details === 'Successful login') {
      return 'ログイン成功';
    }
    
    // ログイン失敗メッセージを翻訳
    if (details.startsWith('Failed login attempt for email:')) {
      const email = details.replace('Failed login attempt for email:', '').trim();
      return `メールでのログイン失敗: ${email}`;
    }
    
    // その他のメッセージはそのまま返す
    return details;
  };

  useEffect(() => {
    dispatch(fetchSecurityLogs({ page: currentPage, limit: itemsPerPage }) as any)
  }, [dispatch, currentPage])

  const { totalPages } = pagination

  return (
    <div className="rounded-md border">
      {loading ? (
        <div className="p-4">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">
          エラーが発生しました: {error}
        </div>
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>イベント</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>タイムスタンプ</TableHead>
                <TableHead>詳細</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.event}</TableCell>
                  <TableCell>{log.ip}</TableCell>
                  <TableCell>
                    {format(new Date(log.timestamp), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
                  </TableCell>
                  <TableCell>{translateLogDetails(log.details)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-center py-4">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                ページ {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

