export interface SalesSummaryResponse {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface DailySalesResponse {
  date: string;
  amount: number;
  count: number;
}

export interface TopProductResponse {
  productId: string;
  productName: string;
  productSku: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface InventorySummaryResponse {
  totalProducts: number;
  totalQuantity: number;
  byWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    quantity: number;
    productCount: number;
  }>;
  lowStock: Array<{
    productId: string;
    productName: string;
    currentStock: number;
  }>;
}

export interface PurchaseSummaryResponse {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  period: {
    startDate: string;
    endDate: string;
  };
}
