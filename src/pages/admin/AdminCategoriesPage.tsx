import React, { useState, useEffect } from "react";
import { categoryService } from "@/src/lib/services/categoryService";
import { Category } from "@/src/types";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { AdminEmptyState } from "@/src/components/admin/AdminEmptyState";
import { AdminLoadingState } from "@/src/components/admin/AdminLoadingState";
import { useToast } from "@/src/context/ToastContext";
import {
  Tags,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";

export const AdminCategoriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const list = await categoryService.getCategories(true);
      setCategories(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80");
    setActive(true);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setActive(cat.active);
    setIsFormOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Category name is required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: description.trim(),
          image: image.trim(),
          active,
        });
        showToast(`Category "${name}" updated.`, "success");
      } else {
        await categoryService.createCategory({
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: description.trim(),
          image: image.trim(),
          active,
        });
        showToast(`Category "${name}" created.`, "success");
      }

      setIsFormOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || "Failed to save category", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      showToast(`Category "${categoryToDelete.name}" removed.`, "success");
      setCategoryToDelete(null);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || "Cannot delete category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">
            Categories Management ({categories.length})
          </h1>
          <p className="text-xs text-stone-500">
            Structure your catalog navigation and organize single-vendor collections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <AdminLoadingState message="Loading categories..." />
      ) : categories.length === 0 ? (
        <AdminEmptyState
          icon={Tags}
          title="No categories found"
          description="Create your first catalog category to organize products."
          actionLabel="+ Add Category"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col justify-between hover:border-stone-300 transition-all"
            >
              <div>
                <div className="h-32 bg-stone-100 relative overflow-hidden">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {cat.active ? (
                      <span className="px-2 py-0.5 bg-emerald-500/90 text-white font-bold rounded-md text-[10px] shadow-xs">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-stone-800/90 text-stone-300 font-bold rounded-md text-[10px] shadow-xs">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-stone-900 tracking-tight">
                      {cat.name}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-full text-xs font-bold">
                      {cat.productCount || 0} product(s)
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {cat.description || "No description provided."}
                  </p>

                  <p className="text-[11px] font-mono text-stone-400">
                    /category/{cat.slug}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Smart Audio"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="smart-audio"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 font-mono text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for category landing page..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4"
                  />
                  <span className="font-semibold text-stone-800">
                    Active (Show in customer navigation & storefront)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? If there are active products attached, you will be required to reassign them first.`}
        confirmLabel="Delete Category"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
