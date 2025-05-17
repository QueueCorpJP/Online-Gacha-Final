"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { uploadProfileImage, deleteProfileImage, fetchProfile } from "@/redux/features/profileSlice"

interface ProfileImageUploadProps {
  defaultImage?: string
  onImageChange?: (url: string | null) => void
}

export function ProfileImageUpload({ defaultImage, onImageChange }: ProfileImageUploadProps) {
  const [image, setImage] = useState<string | null>(defaultImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { imageUploading, data: profileData } = useSelector((state: RootState) => state.profile)

  // プロフィールデータが更新されたら画像を更新
  useEffect(() => {
    if (profileData?.profileUrl) {
      setImage(`${profileData.profileUrl}?t=${new Date().getTime()}`);
      if (onImageChange) {
        onImageChange(profileData.profileUrl);
      }
    } else if (profileData && !profileData.profileUrl) {
      setImage(null);
      if (onImageChange) {
        onImageChange(null);
      }
    }
  }, [profileData, onImageChange]);

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

        setIsUploading(true)
        try {
          // リザルトの型チェックで、fulfilledとrejectedを判別する
          const uploadResult = await dispatch(uploadProfileImage(file))
          
          if (uploadResult.meta.requestStatus === 'fulfilled' && uploadResult.payload?.url) {
            // 明示的にプロフィール情報を再取得して最新状態を確保
            await dispatch(fetchProfile())
            
            // 新しいタイムスタンプ付きのURLを使用してキャッシュ回避
            const imageUrl = `${uploadResult.payload.url}?t=${new Date().getTime()}`
            setImage(imageUrl)
            
            if (onImageChange) {
              onImageChange(uploadResult.payload.url)
            }
            
            toast.success("画像をアップロードしました")
          } else {
            // requestStatusがfulfilledでないか、URLがない場合
            throw new Error(uploadResult.payload?.toString() || "画像アップロードエラー")
          }
        } catch (error) {
          console.error("Error uploading image:", error)
          toast.error("画像のアップロードに失敗しました")
          
          // エラー後にプロフィール情報を再取得
          dispatch(fetchProfile())
        } finally {
          setIsUploading(false)
        }
      }
    },
    [dispatch, onImageChange],
  )

  const deleteImage = async () => {
    if (!image) return

    setIsUploading(true)
    try {
      // リザルトの型チェックで、fulfilledとrejectedを判別する
      const deleteResult = await dispatch(deleteProfileImage())
      
      if (deleteResult.meta.requestStatus === 'fulfilled') {
        // 明示的にプロフィール情報を再取得して最新状態を確保
        await dispatch(fetchProfile())
        
        setImage(null)
        
        if (onImageChange) {
          onImageChange(null)
        }
        
        toast.success("画像を削除しました")
      } else {
        // requestStatusがfulfilledでない場合
        throw new Error(deleteResult.payload?.toString() || "画像削除エラー")
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("画像の削除に失敗しました")
      
      // エラー後にプロフィール情報を再取得
      dispatch(fetchProfile())
    } finally {
      setIsUploading(false)
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
    disabled: imageUploading || isUploading,
  })

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">プロフィール画像</div>

      {image ? (
        <div className="relative">
          <img
            src={`${image}${image.includes('?') ? '&' : '?'}t=${new Date().getTime()}`}
            alt="プロフィール画像"
            className="h-32 w-32 rounded-full object-cover border"
            onError={(e) => {
              // 画像読み込みエラー時の処理
              console.error("Image load error, retrying...");
              const imgElement = e.target as HTMLImageElement;
              // 再試行回数を制限するためのカスタム属性
              const retryCount = +(imgElement.getAttribute('data-retry-count') || '0');
              const currentImage = image; // 現在のスコープの値をキャプチャ
              
              if (retryCount < 3 && currentImage) {
                // 画像URLにタイムスタンプを追加して再読み込み
                imgElement.src = `${currentImage}${currentImage.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
                imgElement.setAttribute('data-retry-count', (retryCount + 1).toString());
              } else {
                // 3回試行しても失敗した場合、プロフィールデータを再取得
                dispatch(fetchProfile());
              }
            }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-0 right-0 h-6 w-6 rounded-full"
            onClick={deleteImage}
            disabled={imageUploading || isUploading}
          >
            {(imageUploading || isUploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
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
          {(imageUploading || isUploading) && (
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