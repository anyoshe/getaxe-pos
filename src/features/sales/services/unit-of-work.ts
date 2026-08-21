import type {
    Transaction,
} from "@/repositories/base";

import {
    CustomerRepository,
    PaymentRepository,
    SaleItemBatchRepository,
    SaleItemRepository,
    SaleRepository,
    SaleReturnItemRepository,
    SaleReturnRepository,
    PaymentReversalRepository,
} from "@/repositories/sales";

import {
    ProductBatchRepository,
    InventoryBalanceRepository,
    StockMovementRepository,
    ProductSerialRepository,
} from "@/repositories/inventory";

export class SalesUnitOfWork {

    readonly customers: CustomerRepository;

    readonly sales: SaleRepository;

    readonly saleItems: SaleItemRepository;

    readonly saleItemBatches: SaleItemBatchRepository;

    readonly payments: PaymentRepository;

    readonly saleReturns: SaleReturnRepository;

    readonly saleReturnItems: SaleReturnItemRepository;

    readonly batches:
        ProductBatchRepository;


    readonly balances:
        InventoryBalanceRepository;


    readonly movements:
        StockMovementRepository;

    readonly serials: ProductSerialRepository;

    readonly paymentReversals:
        PaymentReversalRepository;

    constructor(
        transaction: Transaction
    ) {

        this.customers =
            new CustomerRepository(
                transaction
            );

        this.sales =
            new SaleRepository(
                transaction
            );

        this.saleItems =
            new SaleItemRepository(
                transaction
            );

        this.saleItemBatches =
            new SaleItemBatchRepository(
                transaction
            );

        this.payments =
            new PaymentRepository(
                transaction
            );

        this.saleReturns =
            new SaleReturnRepository(
                transaction
            );

        this.saleReturnItems =
            new SaleReturnItemRepository(
                transaction
            );

        this.batches =
            new ProductBatchRepository(
                transaction
            );


        this.balances =
            new InventoryBalanceRepository(
                transaction
            );


        this.movements =
            new StockMovementRepository(
                transaction
            );

        this.serials =
            new ProductSerialRepository(
                transaction
            );

        this.paymentReversals =
            new PaymentReversalRepository(
                transaction
            );

    }

}