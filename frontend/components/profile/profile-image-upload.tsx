"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { uploadProfileImage, deleteProfileImage } from "@/redux/features/profileSlice"

interface ProfileImageUploadProps {
  defaultImage?: string
  onImageChange?: (url: string | null) => void
}

export function ProfileImageUpload({ defaultImage, onImageChange }: ProfileImageUploadProps) {
  const [image, setImage] = useState<string | null>(defaultImage || null)
  const dispatch = useDispatch<AppDispatch>()
  const { imageUploading } = useSelector((state: RootState) => state.profile)

  useEffect(() => {
    if (defaultImage) {
      setImage(defaultImage)
    }
  }, [defaultImage])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles?.length > 0) {
        const file = acceptedFiles[0]
        
        // ファイルサイズチェック (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("ファイルサイズが大きすぎます（最大5MB）")
          return
        }

        try {
          const result = await dispatch(uploadProfileImage(file)).unwrap()
          const imageUrl = result.url
          setImage(imageUrl)
          
          if (onImageChange) {
            onImageChange(imageUrl)
          }
          
          toast.success("画像をアップロードしました")
        } catch (error) {
          console.error("Error uploading image:", error)
          toast.error("画像のアップロードに失敗しました")
        }
      }
    },
    [dispatch, onImageChange],
  )

  const deleteImage = async () => {
    if (!image) return

    try {
      await dispatch(deleteProfileImage()).unwrap()
      setImage(null)
      
      if (onImageChange) {
        onImageChange(null)
      }
      
      toast.success("画像を削除しました")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("画像の削除に失敗しました")
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: imageUploading,
  })

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">プロフィール画像</div>

      {image ? (
        <div className="relative">
          <img
            src={image}
            alt="プロフィール画像"
            className="h-32 w-32 rounded-full object-cover border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-0 right-0 h-6 w-6 rounded-full"
            onClick={deleteImage}
            disabled={imageUploading}
          >
            {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            {isDragActive
              ? "ここに画像をドロップ"
              : "画像をドラッグ＆ドロップ、またはクリックして選択"}
          </p>
          <p className="text-xs text-center text-muted-foreground mt-1">
            対応形式: JPG, PNG, GIF
          </p>
          <p className="text-xs text-center text-muted-foreground">
            最大サイズ: 5MB
          </p>
          {imageUploading && (
            <div className="mt-2 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">アップロード中...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 