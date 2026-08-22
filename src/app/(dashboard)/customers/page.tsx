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
        customers={customers.map((c) => ({
          id: c.id,
          customerNumber: c.customerNumber,
          firstName: c.firstName,
          lastName: c.lastName,
          companyName: c.companyName,
          phone: c.phone,
          email: c.email,
        }))}
      />
    </div>
  );
}
