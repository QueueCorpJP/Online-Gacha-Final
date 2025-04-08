import Image from "next/image"
import { cn } from "@/lib/utils"

interface GachaImageProps {
  src: string
  alt: string
  className?: string
}

export function GachaImage({ src, alt, className }: GachaImageProps) {
  return (
    <div className={cn("relative rounded-2xl bg-gray-100 h-[100vw] lg:h-auto", className)}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt || "ガチャ画像"}
        fill
        className="object-contain rounded-2xl"
        priority
      />
    </div>
  )
}
