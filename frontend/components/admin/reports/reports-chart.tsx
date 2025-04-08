"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { fetchReportData, exportReport } from "@/redux/features/reportSlice"
import { RootState } from "@/redux/store"
import { useTranslations } from "@/hooks/use-translations"
import { Loader2 } from "lucide-react"

const reportTypes = ["sales", "users", "inventory"] as const
type ReportType = typeof reportTypes[number]

interface ReportData {
  name: string;
  sales?: number;
  users?: number;
  inventory?: number;
}

export function ReportChart() {
    const dispatch = useDispatch()
    const { data: rawData, loading, error } = useSelector((state: RootState) => state.reports)
    const [reportType, setReportType] = useState<ReportType>("sales")
    const { t } = useTranslations();

    const data = rawData?.map(item => ({
        ...item,
        name: new Date(item.name).toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }))

    useEffect(() => {
        dispatch(fetchReportData(reportType) as any)
    }, [dispatch, reportType])

    const handleExport = async (format: 'csv' | 'pdf') => {
        try {
            const response = await dispatch(exportReport({ type: reportType, format }) as any)
            
            // Create blob and download
            const blob = new Blob([response.payload], {
                type: format === 'csv' ? 'text/csv' : 'application/pdf'
            })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `report-${reportType}.${format}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url) // Clean up
            
            toast.success(t("reports.export.success", { format: format.toUpperCase() }))
        } catch (error) {
            console.error('Export error:', error)
            toast.error(t("reports.export.error"))
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500">{t("reports.error", { message: error })}</div>
    }

    const renderBars = () => {
        switch (reportType) {
            case 'sales':
                return (
                    <>
                        <Bar 
                            dataKey="sales" 
                            name={t("reports.chart.sales")} 
                            fill="#818CF8" 
                        />
                    </>
                )
            case 'users':
                return (
                    <>
                        <Bar 
                            dataKey="Active" 
                            name={t("reports.chart.active")} 
                            fill="#6EE7B7" 
                        />
                        <Bar 
                            dataKey="Suspended" 
                            name={t("reports.chart.suspended")} 
                            fill="#FCD34D" 
                        />
                        <Bar 
                            dataKey="Banned" 
                            name={t("reports.chart.banned")} 
                            fill="#EF4444" 
                        />
                    </>
                )
            case 'inventory':
                return (
                    <>
                        <Bar 
                            dataKey="total" 
                            name={t("reports.chart.inventory")} 
                            fill="#818CF8" 
                        />
                        <Bar 
                            dataKey="lowStock" 
                            name={t("inventory.status.status.low")} 
                            fill="#EF4444" 
                        />
                        <Bar 
                            dataKey="normalStock" 
                            name={t("inventory.status.status.normal")} 
                            fill="#6EE7B7" 
                        />
                    </>
                )
        }
    }

    return (
        <div className="space-y-6 max-w-[100vw]">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{t("reports.title")}</h2>
            </div>
            <div className="flex items-center gap-4">
                <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {reportTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {t(`reports.types.${type}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="default" onClick={() => handleExport('csv')}>
                    {t("reports.export.csv")}
                </Button>
                <Button variant="default" onClick={() => handleExport('pdf')}>
                    {t("reports.export.pdf")}
                </Button>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {renderBars()}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

