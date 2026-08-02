export interface CreateProductInput {
  businessId: string;

  categoryId: string;

  supplierId: string | null;

  manufacturerId: string | null;

  name: string;

  genericName: string | null;

  productBrand: string | null;

  description: string | null;

  sku: string | null;

  barcode: string | null;

  packSize: string | null;

  costPrice: number | null;

  trackInventory: boolean;

  trackBatch: boolean;

  trackExpiry: boolean;

  serialized: boolean;

  allowNegativeStock: boolean;

  minimumStock: number;

  reorderLevel: number;
}