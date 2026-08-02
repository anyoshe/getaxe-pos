import {
    categoryRepository,
} from "@/repositories/inventory/categories.repository";

import {
    supplierRepository,
} from "@/repositories/inventory/suppliers.repository";

import {
    unitsRepository,
} from "@/repositories/settings/units.repository";

import type {
    ProductContext,
} from "../types";


export class ProductContextService {


    async getContext(
        businessId: string
    ): Promise<ProductContext> {


        const [
            categories,
            suppliers,
            units,

        ] = await Promise.all([

            categoryRepository.findAll(
                businessId
            ),

            supplierRepository.findAll(
                businessId
            ),

            unitsRepository.findAll(
                businessId
            ),

        ]);


        return {

            categories,

            suppliers,

            units,


            manufacturers: [],

            dosageForms: [],

            drugCategories: [],

            drugStrengths: [],

            prescriptionTypes: [],


            taxRates: [],


            incomeAccounts: [],

            expenseAccounts: [],

            inventoryAccounts: [],

        };

    }

}


export const productContextService =
    new ProductContextService();