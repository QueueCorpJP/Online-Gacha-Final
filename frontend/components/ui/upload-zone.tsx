"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"

interface UploadZoneProps {
    onFileSelect: (file: File) => void
    maxSize?: number
    accept?: Record<string, string[]>
    className?: string
    defaultPreview?: string
  }

export function UploadZone({
  onFileSelect,
  maxSize = 10 * 1024 * 1024, // 10MB default (increased from 5MB)
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  },
  className,
  defaultPreview,
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [preview, setPreview] = useState<string>(defaultPreview || "")
  const { t } = useTranslations()
  
  useEffect(() => {
    if (defaultPreview) {
      console.log(defaultPreview);
      setPreview(defaultPreview)
    }
  }, [defaultPreview])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length > 0) {
        const file = acceptedFiles[0]
        onFileSelect(file)
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  })

  const clearPreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview("")
    onFileSelect(null as any)
  }, [onFileSelect])

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative cursor-pointer rounded-lg border-2 border-dashed p-4 transition-colors",
        isDragActive && "border-purple-400 bg-purple-50",
        isDragReject && "border-red-400 bg-red-50",
        className,
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative h-64 w-full">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-center">
            <p className="text-lg font-medium">{t("upload.clickToUpload")}</p>
            <p className="text-gray-500">{t("upload.dragAndDrop")}</p>
          </div>
        </div>
      )}
    </div>
  )
}

