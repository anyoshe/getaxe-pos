import { getCurrentUser } from "@/lib/auth/current-user";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { CustomersClient } from "@/features/sales/components/customers/customers-client";

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const customers = await salesQueryService.listCustomers(user.businessId);

  return (
    <div className="p-4 sm:p-6">
      <CustomersClient
        customers={customers.map((c) => {
          const row = c as typeof c & {
            idNumber?: string | null;
            allowCredit?: boolean;
            creditLimit?: string | number;
            loyaltyPoints?: number;
          };
          return {
            id: row.id,
            customerNumber: row.customerNumber,
            firstName: row.firstName,
            lastName: row.lastName,
            companyName: row.companyName,
            phone: row.phone,
            email: row.email,
            idNumber: row.idNumber ?? null,
            allowCredit: Boolean(row.allowCredit),
            creditLimit: row.creditLimit ?? 0,
            loyaltyPoints: row.loyaltyPoints ?? 0,
          };
        })}
      />
    </div>
  );
}
