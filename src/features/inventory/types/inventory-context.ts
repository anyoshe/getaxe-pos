import type {
    ProductBatchRepository,
    InventoryBalanceRepository,
    StockMovementRepository,
} from "@/repositories/inventory";

export interface InventoryOperationsContext {

    batches: ProductBatchRepository;

    balances: InventoryBalanceRepository;

    movements: StockMovementRepository;

}