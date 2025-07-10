import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { ProductIcon, TreasureChestIcon } from '@/app/icons/icons';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  iconName?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-NG').format(price);
  };

  return (
    <div
      className="relative select-none rounded-[10px] bg-[#F9F9F9]"
      style={{ width: 315, height: 269 }}
    >
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
        <div
          className="flex items-end justify-center text-center text-[#17478B]"
          style={{
            width: 200,
            height: 30,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            lineHeight: '30px',
            letterSpacing: 0,
          }}
        >
          {product.name}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            aria-label={`Edit ${product.name}`}
            className="flex h-6 w-6 items-center justify-center rounded-full text-green-600 transition-colors duration-200 hover:bg-green-50 hover:text-green-700"
            style={{ width: 24, height: 24 }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            aria-label={`Delete ${product.name}`}
            className="flex h-6 w-6 items-center justify-center rounded-full text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
            style={{ width: 24, height: 24 }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center space-x-4">
        {/* Icon */}
        <div
          className="flex items-center justify-center"
          style={{ width: 80, height: 80 }}
        >
          <ProductIcon />
        </div>

        <div
          className="flex items-end justify-center text-center text-[#17478B]"
          style={{
            width: 26,
            height: 32,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 32,
            lineHeight: '32px',
            letterSpacing: 0,
          }}
        >
          x{product.quantity}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center space-x-2">
        <div
          className="flex items-center justify-center"
          style={{ width: 24, height: 24 }}
        >
          <TreasureChestIcon />
        </div>

        <div
          className="flex items-end text-[#17478B]"
          style={{
            width: 70,
            height: 30,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 26,
            lineHeight: '30px',
            letterSpacing: 0,
          }}
        >
          {product.currency}
          {formatPrice(product.price)}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
