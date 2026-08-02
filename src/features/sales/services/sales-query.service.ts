import { Repository } from "@/repositories/base";

import {
    SalesUnitOfWork,
} from "./unit-of-work";

export class SalesQueryService {

    async getSale(
        saleId: string
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new SalesUnitOfWork(tx);

                return uow.sales.findById(
                    saleId
                );

            }
        );

    }

    async getSales(
        businessId: string
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new SalesUnitOfWork(tx);

                return uow.sales.findAll(
                    businessId
                );

            }
        );

    }

}

export const salesQueryService =
    new SalesQueryService();