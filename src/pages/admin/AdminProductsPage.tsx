import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { productService } from "@/src/lib/services/productService";
import { categoryService } from "@/src/lib/services/categoryService";
import { Product } from "@/src/types";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { AdminEmptyState } from "@/src/components/admin/AdminEmptyState";
import { AdminLoadingState } from "@/src/components/admin/AdminLoadingState";
import { useToast } from "@/src/context/ToastContext";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Package,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const AdminProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters from URL or default
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const selectedStock = searchParams.get("stockStatus") || "all";
  const selectedPub = searchParams.get("publicationStatus") || "all";
  const selectedSort = searchParams.get("sortBy") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category list
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    categoryService.getCategories(true).then((cats) => {
      setCategories(cats.map((c) => c.name));
    });
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getAdminProducts({
        search: searchQuery,
        category: selectedCategory,
        stockStatus: selectedStock as any,
        publicationStatus: selectedPub as any,
        sortBy: selectedSort as any,
        page: currentPage,
        limit: 10,
      });

      setProducts(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      showToast("Failed to load products", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedStock, selectedPub, selectedSort, currentPage]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "1") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== "page") {
      next.delete("page");
    }
    setSearchParams(next);
  };

  const handleTogglePublish = async (p: Product) => {
    try {
      const nextStatus = p.published === false;
      await productService.togglePublish(p.id, nextStatus);
      showToast(
        `Product "${p.title}" is now ${nextStatus ? "Published" : "Draft"}.`,
        "info"
      );
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to update publication status", "error");
    }
  };

  const handleDuplicate = async (p: Product) => {
    try {
      const duplicated = await productService.duplicateProduct(p.id);
      showToast(`Duplicated as draft "${duplicated.title}".`, "success");
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || "Could not duplicate product", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      showToast(`Product "${productToDelete.title}" removed from catalog.`, "success");
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to delete product", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">
            Products Catalog ({total})
          </h1>
          <p className="text-xs text-stone-500">
            Create, edit, duplicate, and manage inventory for single-vendor items.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam("search", e.target.value)}
              placeholder="Search by title, SKU, brand, tag..."
              className="w-full pl-10 pr-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => updateParam("category", e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-stone-900"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={selectedStock}
              onChange={(e) => updateParam("stockStatus", e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-stone-900"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (≤5)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Publication Filter & Sort */}
          <div className="flex gap-2">
            <select
              value={selectedPub}
              onChange={(e) => updateParam("publicationStatus", e.target.value)}
              className="w-full px-2.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-stone-900"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={selectedSort}
              onChange={(e) => updateParam("sortBy", e.target.value)}
              className="w-full px-2.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-stone-900"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name A–Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Table on Desktop, Cards on Mobile */}
      {isLoading ? (
        <AdminLoadingState message="Loading catalog items..." />
      ) : products.length === 0 ? (
        <AdminEmptyState
          icon={Package}
          title="No products found"
          description="No products matched your search or active filter combination."
          actionLabel="+ Add New Product"
          actionHref="/admin/products/new"
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="w-11 h-11 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="font-bold text-stone-900 hover:underline line-clamp-1"
                          >
                            {p.title}
                          </Link>
                          <p className="text-[11px] text-stone-400 truncate">
                            {p.brand} {p.variants && p.variants.length > 0 && `• ${p.variants.length} variant(s)`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-stone-600 font-bold">
                      {p.sku}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 text-stone-700">
                      <span className="px-2 py-0.5 bg-stone-100 rounded text-[11px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 font-bold text-stone-900">
                      Rs. {p.price.toLocaleString()}
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="text-[10px] text-stone-400 line-through block font-normal">
                          Rs. {p.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900">{p.stock} units</span>
                        <StatusBadge type="stock" status={p.stockStatus} size="sm" />
                      </div>
                    </td>

                    {/* Publication Status */}
                    <td className="py-3.5 px-3">
                      <StatusBadge
                        type="publication"
                        status={p.published !== false ? "published" : "draft"}
                        size="sm"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View in Store */}
                        <Link
                          to={`/product/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="View on public storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Toggle Draft / Published */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(p)}
                          className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title={p.published !== false ? "Move to Draft" : "Publish to Store"}
                        >
                          {p.published !== false ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="font-bold text-xs text-stone-900 hover:underline line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                      SKU: {p.sku} • {p.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-extrabold text-xs text-stone-900">
                        Rs. {p.price.toLocaleString()}
                      </span>
                      <StatusBadge
                        type="publication"
                        status={p.published !== false ? "published" : "draft"}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-stone-700">
                      {p.stock} in stock
                    </span>
                    <StatusBadge type="stock" status={p.stockStatus} size="sm" />
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="px-2.5 py-1 bg-stone-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(p)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-stone-200 text-xs">
              <span className="text-stone-500">
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({total} items)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => updateParam("page", (currentPage - 1).toString())}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateParam("page", (currentPage + 1).toString())}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Delete Product from Store Catalog?"
        message={`Are you sure you want to remove "${productToDelete?.title}"? This product will be archived and will no longer appear in the customer catalog. Historical orders will remain intact.`}
        confirmLabel="Delete Product"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
