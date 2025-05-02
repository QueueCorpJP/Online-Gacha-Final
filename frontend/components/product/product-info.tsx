export default function ProductInfo() {
    return (
      <div className="py-4">
        <h2 className="text-lg mb-4">商品説明</h2>
        <p className="text-gray-600 mb-8">
          ポケモンカードの限定ガチャです。レアカードやホロカードなど、貴重なカードを手に入れるチャンス！1回の購入で1枚のカードが当たります。
        </p>
  
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <h3 className="text-purple-500 mb-2">商品内容</h3>
            <p className="text-gray-600">ポケモンカード1枚（ランダム）</p>
          </div>
          <div>
            <h3 className="text-purple-500 mb-2">販売期間</h3>
            <p className="text-gray-600">2024年1月1日まで</p>
          </div>
          <div>
            <h3 className="text-purple-500 mb-2">レア度</h3>
            <p className="text-gray-600">SR: 5%, HR: 1%, UR: 0.1%</p>
          </div>
          <div>
            <h3 className="text-purple-500 mb-2">注意事項</h3>
            <p className="text-gray-600">購入後のキャンセル・返品はできません</p>
          </div>
        </div>
      </div>
    )
  }
  
  