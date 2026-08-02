import {
    and,
    asc,
    eq,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    customers,
} from "@/db/schema/sales/customers";

import {
    BaseRepository,
} from "../base";

type CustomerInsert =
    InferInsertModel<typeof customers>;

export class CustomerRepository
    extends BaseRepository {

    async findAll(
        businessId: string
    ) {

        return this.database.query.customers.findMany({
            where: eq(
                customers.businessId,
                businessId
            ),

            orderBy: [
                asc(customers.firstName),
            ],
        });

    }

    async findById(
        id: string
    ) {

        return this.database.query.customers.findFirst({
            where: eq(
                customers.id,
                id
            ),
        });

    }

    async create(
        data: CustomerInsert
    ) {

        const [customer] =
            await this.database
                .insert(customers)
                .values(data)
                .returning();

        return customer;

    }

    async update(
        id: string,
        data: Partial<CustomerInsert>
    ) {

        const [customer] =
            await this.database
                .update(customers)
                .set(data)
                .where(
                    eq(
                        customers.id,
                        id
                    )
                )
                .returning();

        return customer;

    }

    async delete(
        id: string
    ) {

        const [customer] =
            await this.database
                .delete(customers)
                .where(
                    eq(
                        customers.id,
                        id
                    )
                )
                .returning();

        return customer;

    }

    async findByCustomerNumber(
        businessId: string,
        customerNumber: string
    ) {

        return this.database.query.customers.findFirst({
            where: and(
                eq(
                    customers.businessId,
                    businessId
                ),
                eq(
                    customers.customerNumber,
                    customerNumber
                )
            ),
        });

    }

}

export const customerRepository =
    new CustomerRepository();