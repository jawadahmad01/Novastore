import React, { useState } from "react";
import { ProductVariant } from "@/src/types";
import { Plus, Trash2, Layers, AlertCircle } from "lucide-react";

interface ProductVariantEditorProps {
  variants: ProductVariant[];
  basePrice: number;
  baseSku: string;
  onChange: (variants: ProductVariant[]) => void;
}

export const ProductVariantEditor: React.FC<ProductVariantEditorProps> = ({
  variants,
  basePrice,
  baseSku,
  onChange,
}) => {
  const [hasVariants, setHasVariants] = useState(variants.length > 0);
  const [newType, setNewType] = useState<"color" | "size" | "storage" | "style">("color");
  const [newValue, setNewValue] = useState("");
  const [newStock, setNewStock] = useState("10");
  const [newPriceMod, setNewPriceMod] = useState("0");

  const handleToggleVariants = (enabled: boolean) => {
    setHasVariants(enabled);
    if (!enabled) {
      onChange([]);
    }
  };

  const handleAddVariant = () => {
    if (!newValue.trim()) return;

    const skuSuffix = newValue.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    const sku = `${baseSku || "NV-PROD"}-${skuSuffix}`;

    const newVariant: ProductVariant = {
      id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${newType.charAt(0).toUpperCase() + newType.slice(1)}: ${newValue.trim()}`,
      type: newType,
      value: newValue.trim(),
      sku,
      stock: parseInt(newStock) || 0,
      priceModifier: parseInt(newPriceMod) || 0,
    };

    onChange([...variants, newVariant]);
    setNewValue("");
    setNewStock("10");
    setNewPriceMod("0");
  };

  const handleRemoveVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    onChange(
      variants.map((v) => {
        if (v.id === id) {
          return { ...v, [field]: value };
        }
        return v;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-stone-900 block">
            Product Variants (Optional)
          </label>
          <p className="text-[11px] text-stone-500">
            Does this product come in multiple colors, sizes, or capacities?
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => handleToggleVariants(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
          <span className="ml-2 text-xs font-semibold text-stone-700">
            {hasVariants ? "Variants Enabled" : "Single Product"}
          </span>
        </label>
      </div>

      {hasVariants && (
        <div className="border border-stone-200 bg-stone-50/50 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
          {/* Add New Variant Row */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
            <div>
              <label className="text-[10px] font-bold text-stone-600 block mb-1">
                Option Type
              </label>
              <select
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-stone-200 text-xs bg-stone-50 focus:outline-none focus:border-stone-900"
              >
                <option value="color">Color</option>
                <option value="size">Size</option>
                <option value="storage">Storage</option>
                <option value="style">Style / Edition</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-600 block mb-1">
                Variant Value *
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. Midnight Black / 128GB / Large"
                className="w-full px-2.5 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-600 block mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-600 block mb-1">
                Price Modifier (PKR)
              </label>
              <input
                type="number"
                value={newPriceMod}
                onChange={(e) => setNewPriceMod(e.target.value)}
                placeholder="+/- 0"
                className="w-full px-2.5 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddVariant}
                disabled={!newValue.trim()}
                className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>
          </div>

          {/* List of Configured Variants */}
          {variants.length > 0 ? (
            <div className="divide-y divide-stone-200 bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="bg-stone-100/80 px-4 py-2 grid grid-cols-12 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                <span className="col-span-4">Variant Name / Type</span>
                <span className="col-span-3">SKU</span>
                <span className="col-span-2">Stock</span>
                <span className="col-span-2">Effective Price</span>
                <span className="col-span-1 text-right">Action</span>
              </div>

              {variants.map((v) => {
                const effectivePrice = basePrice + (v.priceModifier || 0);
                return (
                  <div
                    key={v.id}
                    className="px-4 py-3 grid grid-cols-12 items-center gap-2 text-xs"
                  >
                    <div className="col-span-4 min-w-0">
                      <p className="font-bold text-stone-900 truncate">{v.value}</p>
                      <span className="text-[10px] text-stone-400 capitalize">{v.type}</span>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(v.id, "sku", e.target.value)}
                        className="w-full px-2 py-1 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, "stock", parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 border border-stone-200 rounded text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div className="col-span-2 font-bold text-stone-900">
                      Rs. {effectivePrice.toLocaleString()}
                      {v.priceModifier !== 0 && (
                        <span className="text-[10px] font-normal text-stone-400 ml-1">
                          ({v.priceModifier! > 0 ? "+" : ""}{v.priceModifier})
                        </span>
                      )}
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-4 text-xs text-stone-400 italic">
              No variant options added yet. Define at least one option above or turn variants off.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
