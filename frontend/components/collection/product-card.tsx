import Image from "next/image"
import { Star } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    title: string
    rating: number
    price: number
    isPricePerTry: boolean
    remainingTime: string
    image: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <div className="aspect-square relative">
        <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="mb-2 font-medium">{product.title}</h3>
        <div className="mb-2 flex items-center">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="ml-1 text-sm">{product.rating}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">残り {product.remainingTime}</span>
          <span className="font-medium text-purple-600">
            ¥{product.price.toLocaleString()}
            {product.isPricePerTry && "/回"}
          </span>
        </div>
      </div>
    </div>
  )
}

