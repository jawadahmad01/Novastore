import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product, ProductCategory } from "@/src/types";
import { productService } from "@/src/lib/services/productService";
import { categoryService } from "@/src/lib/services/categoryService";
import { ProductImageManager } from "./ProductImageManager";
import { ProductVariantEditor } from "./ProductVariantEditor";
import { useToast } from "@/src/context/ToastContext";
import {
  Save,
  ArrowLeft,
  Eye,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  Tag,
  CheckCircle2,
  DollarSign,
  Boxes,
} from "lucide-react";

interface ProductFormProps {
  initialProduct?: Product;
  isEditing?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Categories list
  const [categories, setCategories] = useState<string[]>([
    "Electronics",
    "Mobile Accessories",
    "Home & Lifestyle",
    "Fashion",
    "Beauty & Personal Care",
    "Kitchen",
    "Sports & Fitness",
    "Bags & Accessories",
  ]);

  // Form Fields
  const [title, setTitle] = useState(initialProduct?.title || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [category, setCategory] = useState<string>(initialProduct?.category || "Electronics");
  const [subcategory, setSubcategory] = useState(initialProduct?.subcategory || "");
  const [brand, setBrand] = useState(initialProduct?.brand || "NOVA");
  const [tagsInput, setTagsInput] = useState((initialProduct?.tags || []).join(", "));

  // Pricing
  const [price, setPrice] = useState(initialProduct?.price?.toString() || "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialProduct?.compareAtPrice ? initialProduct.compareAtPrice.toString() : ""
  );

  // Inventory
  const [sku, setSku] = useState(initialProduct?.sku || `NV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [stock, setStock] = useState(initialProduct?.stock !== undefined ? initialProduct.stock.toString() : "20");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialProduct?.lowStockThreshold !== undefined ? initialProduct.lowStockThreshold.toString() : "5"
  );
  const [trackInventory, setTrackInventory] = useState(
    initialProduct?.trackInventory !== undefined ? initialProduct.trackInventory : true
  );
  const [allowBackorders, setAllowBackorders] = useState(
    initialProduct?.allowBackorders || false
  );

  // Media
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"]
  );
  const [thumbnail, setThumbnail] = useState<string>(
    initialProduct?.thumbnail || (initialProduct?.images?.[0]) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
  );

  // Variants
  const [variants, setVariants] = useState(initialProduct?.variants || []);

  // Flags & Visibility
  const [published, setPublished] = useState(
    initialProduct?.published !== undefined ? initialProduct.published : true
  );
  const [featured, setFeatured] = useState(initialProduct?.featured || false);
  const [bestSeller, setBestSeller] = useState(initialProduct?.bestSeller || false);
  const [newArrival, setNewArrival] = useState(
    initialProduct?.newArrival !== undefined ? initialProduct.newArrival : true
  );
  const [sale, setSale] = useState(initialProduct?.sale || false);

  // Validation & Submission
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    categoryService.getCategories(true).then((cats) => {
      if (cats.length > 0) {
        setCategories(cats.map((c) => c.name));
      }
    });
  }, []);

  // Auto-generate slug from title if new product and user hasn't manually altered slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) {
      errs.title = "Product title is required.";
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      errs.price = "Please enter a valid price (PKR 0 or higher).";
    }

    if (compareAtPrice && (isNaN(Number(compareAtPrice)) || Number(compareAtPrice) < 0)) {
      errs.compareAtPrice = "Compare-at price must be a positive number.";
    }

    if (compareAtPrice && Number(compareAtPrice) <= Number(price)) {
      errs.compareAtPrice = "Compare-at price should be higher than the regular price.";
    }

    if (!category) {
      errs.category = "Please select a product category.";
    }

    if (!sku.trim()) {
      errs.sku = "Product SKU identifier is required.";
    }

    if (stock === "" || isNaN(Number(stock)) || Number(stock) < 0) {
      errs.stock = "Stock quantity cannot be negative.";
    }

    if (images.length === 0) {
      errs.images = "Please include at least one product image.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please correct the highlighted form errors.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const parsedPrice = Math.round(Number(price));
      const parsedCompare = compareAtPrice ? Math.round(Number(compareAtPrice)) : undefined;

      const productPayload: Partial<Product> = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        shortDescription: shortDescription.trim(),
        description: description.trim() || shortDescription.trim(),
        category: category as any,
        subcategory: subcategory.trim() || undefined,
        brand: brand.trim() || "NOVA STORE",
        price: parsedPrice,
        compareAtPrice: parsedCompare,
        sku: sku.trim().toUpperCase(),
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold) || 5,
        trackInventory,
        allowBackorders,
        images,
        thumbnail: thumbnail || images[0],
        variants,
        tags: parsedTags,
        published,
        featured,
        bestSeller,
        newArrival,
        sale: Boolean(sale || (parsedCompare && parsedCompare > parsedPrice)),
      };

      if (isEditing && initialProduct) {
        await productService.updateProduct(initialProduct.id, productPayload);
        showToast(`Product "${title}" updated successfully.`, "success");
      } else {
        await productService.createProduct(productPayload);
        showToast(`Product "${title}" published to catalog.`, "success");
      }

      navigate("/admin/products");
    } catch (err: any) {
      showToast(err.message || "Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12" noValidate>
      {/* Top Header & Save Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              {isEditing ? `Edit Product: ${initialProduct?.title}` : "Create New Product"}
            </h1>
            <p className="text-xs text-stone-500">
              {isEditing
                ? "Update catalog pricing, inventory, variants and status."
                : "Add a single-vendor item to the NOVA STORE online catalog."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditing ? "Save Changes" : "Create Product"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Info, Pricing, Variants, Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
              General Information
            </h2>

            {/* Product Title */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Wireless Noise-Cancelling Headphones Pro"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                  errors.title
                    ? "border-rose-400 bg-rose-50/40"
                    : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                URL Slug
              </label>
              <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-500">
                <span className="text-stone-400 select-none">/products/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="product-unique-slug"
                  className="w-full bg-transparent text-stone-900 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Short Description (Catalog card subtitle)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. 40-hour battery life with hybrid active noise cancellation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Product Overview & Specifications
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive description for the product detail page..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white resize-y"
              />
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Pricing (PKR)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Selling Price (Rs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-stone-400 select-none">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4999"
                    className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none transition-all ${
                      errors.price
                        ? "border-rose-400 bg-rose-50/40"
                        : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Compare-at Price (Original Strike-through)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-stone-400 select-none">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="6999"
                    className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                      errors.compareAtPrice
                        ? "border-rose-400 bg-rose-50/40"
                        : "border-stone-200 bg-stone-50/50 focus:border-stone-900 focus:bg-white"
                    }`}
                  />
                </div>
                {errors.compareAtPrice && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {errors.compareAtPrice}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-600" />
              <span>Inventory & Stock Control</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  SKU Identifier *
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="NV-AUD-001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-mono font-bold focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="25"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-bold focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                />
                <span>Track inventory level automatically</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowBackorders}
                  onChange={(e) => setAllowBackorders(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                />
                <span>Allow customer backorders when out of stock</span>
              </label>
            </div>
          </div>

          {/* Media & Images Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <ProductImageManager
              images={images}
              thumbnail={thumbnail}
              onChange={(newImgs, newThumb) => {
                setImages(newImgs);
                setThumbnail(newThumb);
              }}
            />
          </div>

          {/* Variants Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <ProductVariantEditor
              variants={variants}
              basePrice={Number(price) || 0}
              baseSku={sku}
              onChange={(newVars) => setVariants(newVars)}
            />
          </div>
        </div>

        {/* Right 1 Column: Category, Organization, Flags, Status */}
        <div className="space-y-6">
          {/* Status & Publication */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
              Publishing Status
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 hover:border-stone-300 cursor-pointer bg-stone-50/50">
                <div>
                  <p className="text-xs font-bold text-stone-900">Published</p>
                  <p className="text-[11px] text-stone-500">Live in public store</p>
                </div>
                <input
                  type="radio"
                  name="publication"
                  checked={published}
                  onChange={() => setPublished(true)}
                  className="text-stone-900 focus:ring-stone-900 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 hover:border-stone-300 cursor-pointer bg-stone-50/50">
                <div>
                  <p className="text-xs font-bold text-stone-900">Draft</p>
                  <p className="text-[11px] text-stone-500">Hidden from customers</p>
                </div>
                <input
                  type="radio"
                  name="publication"
                  checked={!published}
                  onChange={() => setPublished(false)}
                  className="text-stone-900 focus:ring-stone-900 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Organization & Category */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
              Categorization
            </h3>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold focus:outline-none focus:border-stone-900 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subcategory (Optional)
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Headphones, Power, Desk Accessories"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="NOVA STORE"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="wireless, audio, bluetooth, bestseller"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Badges & Merchandising */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
              Merchandising Badges
            </h3>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                />
                <span className="font-semibold text-stone-800">Featured Spotlight</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                />
                <span className="font-semibold text-stone-800">Best Seller Ribbon</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newArrival}
                  onChange={(e) => setNewArrival(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                />
                <span className="font-semibold text-stone-800">New Arrival Tag</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sale}
                  onChange={(e) => setSale(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                />
                <span className="font-semibold text-stone-800">Flash Sale Badge</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
