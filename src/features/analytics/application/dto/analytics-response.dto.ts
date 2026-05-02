
/**
 * Sales Analytics Response
 */
export class SalesAnalyticsDto {
  totalRevenue: number;

  totalOrders: number;

  averageOrderValue: number;

  totalItemsSold: number;

  revenueGrowth: number;

  ordersGrowth: number;

  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;

  ordersByStatus: Record<string, number>;
}

/**
 * Top Product Item
 */
export class TopProductDto {
  productId: string;

  productName: string;

  quantitySold: number;

  revenue: number;

  orderCount: number;
}

/**
 * Inventory Analytics Response
 */
export class InventoryAnalyticsDto {
  totalInventoryValue: number;

  totalStockUnits: number;

  lowStockCount: number;

  outOfStockCount: number;

  averageTurnoverRate: number;

  topProductsByValue: Array<{
    productId: string;
    productName: string;
    stockValue: number;
    quantity: number;
  }>;

  warehouseInventory: Array<{
    warehouseId: string;
    warehouseName: string;
    totalValue: number;
    totalUnits: number;
  }>;
}

/**
 * Customer Analytics Response
 */
export class CustomerAnalyticsDto {
  totalCustomers: number;

  newCustomers: number;

  repeatCustomers: number;

  retentionRate: number;

  averageLifetimeValue: number;

  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date;
  }>;

  rfmSegmentation: {
    champions: number;
    loyalCustomers: number;
    potentialLoyalists: number;
    recentCustomers: number;
    promising: number;
    needsAttention: number;
    atRisk: number;
    cantLose: number;
    hibernating: number;
    lost: number;
  };
}

/**
 * Business KPIs Response
 */
export class BusinessKPIsDto {
  conversionRate: number;

  averageOrderValue: number;

  customerAcquisitionCost: number;

  orderFulfillmentRate: number;

  averageProcessingTime: number;

  returnRate: number;

  revenuePerCustomer: number;

  inventoryTurnoverRatio: number;

  grossProfitMargin: number;
}

/**
 * Dashboard Summary Response - All key metrics in one
 */
export class DashboardSummaryDto {
  sales: {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
  };

  inventory: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalInventoryValue: number;
  };

  customers: {
    totalCustomers: number;
    newThisMonth: number;
    repeatCustomers: number;
    topCustomerSpend: number;
  };

  topProducts: TopProductDto[];

  recentTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
}
