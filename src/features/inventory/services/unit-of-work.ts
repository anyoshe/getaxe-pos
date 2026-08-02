import type {
    Database,
    Transaction,
} from "@/repositories/base";

import {
    ProductRepository,
    ProductBatchRepository,
    StockMovementRepository,
    SupplierRepository,
    PriceListRepository,
    ProductPriceRepository,
} from "@/repositories/inventory";

import {
    InventoryBalanceRepository,
} from "@/repositories/inventory";

export class InventoryUnitOfWork {
    readonly products: ProductRepository;

    readonly batches: ProductBatchRepository;

    readonly movements: StockMovementRepository;

    readonly suppliers: SupplierRepository;

    readonly priceLists: PriceListRepository;

    readonly productPrices: ProductPriceRepository;

    readonly balances:
        InventoryBalanceRepository;

    constructor(
        database: Database | Transaction
    ) {
        this.products =
            new ProductRepository(database);

        this.batches =
            new ProductBatchRepository(database);

        this.movements =
            new StockMovementRepository(database);

        this.suppliers =
            new SupplierRepository(database);

        this.priceLists =
            new PriceListRepository(database);

        this.productPrices =
            new ProductPriceRepository(database);

        this.balances =
            new InventoryBalanceRepository(database);
    }
}