import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productService } from "@/src/lib/services/productService";
import { Product } from "@/src/types";
import { ProductForm } from "@/src/components/admin/ProductForm";
import { AdminLoadingState } from "@/src/components/admin/AdminLoadingState";
import { AdminEmptyState } from "@/src/components/admin/AdminEmptyState";
import { ArrowLeft } from "lucide-react";

export const AdminProductFormPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const isEditing = Boolean(productId);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      productService
        .getProductById(productId)
        .then((p) => {
          if (p) {
            setProduct(p);
          } else {
            setNotFound(true);
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setIsLoading(false));
    }
  }, [productId]);

  if (isLoading) {
    return <AdminLoadingState message="Loading product data..." />;
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <AdminEmptyState
          title="Product Not Found"
          description={`The product with ID "${productId}" could not be found or has been deleted.`}
          actionLabel="View All Products"
          actionHref="/admin/products"
        />
      </div>
    );
  }

  return (
    <div>
      <ProductForm initialProduct={product || undefined} isEditing={isEditing} />
    </div>
  );
};
