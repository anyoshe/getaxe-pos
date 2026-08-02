export class SalesStatusService {

    calculateStatus(
        saleTotal: number,
        totalPaid: number
    ) {

        if (totalPaid <= 0) {
            return "CREDIT" as const;
        }

        if (totalPaid < saleTotal) {
            return "PARTIALLY_PAID" as const;
        }

        return "COMPLETED" as const;

    }

}

export const salesStatusService =
    new SalesStatusService();