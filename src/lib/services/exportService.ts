import { Order, Product, User } from "@/src/types";

/**
 * Admin Data Export Utility for NOVA STORE
 * 
 * Provides one-click CSV & JSON report generation for store reporting & audits.
 */
export const exportService = {
  /**
   * Export Orders to CSV
   */
  exportOrdersToCSV(orders: Order[]): void {
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Email",
      "Phone",
      "City",
      "Province",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Items Count",
      "Subtotal",
      "Discount",
      "Shipping",
      "Total (PKR)",
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.customer.firstName} ${o.customer.lastName}"`,
      `"${o.customer.email}"`,
      `"${o.customer.phone}"`,
      `"${o.shippingAddress?.city || ""}"`,
      `"${o.shippingAddress?.province || ""}"`,
      `"${o.paymentMethod.toUpperCase()}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      o.items.reduce((sum, it) => sum + it.quantity, 0),
      o.subtotal,
      o.discount,
      o.shipping,
      o.total,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    this._downloadFile(csvContent, `novastore_orders_${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
  },

  /**
   * Export Catalog to CSV
   */
  exportProductsToCSV(products: Product[]): void {
    const headers = [
      "ID",
      "SKU",
      "Title",
      "Category",
      "Brand",
      "Price (PKR)",
      "Compare Price",
      "Stock",
      "Stock Status",
      "Published",
      "Rating",
    ];

    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.sku}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.brand}"`,
      p.price,
      p.compareAtPrice || "",
      p.stock,
      `"${p.stockStatus}"`,
      p.published ? "Yes" : "No",
      p.rating,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    this._downloadFile(csvContent, `novastore_catalog_${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
  },

  _downloadFile(content: string, fileName: string, contentType: string): void {
    const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
