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
          customerType: (c.customerType as "INDIVIDUAL" | "BUSINESS") ?? "INDIVIDUAL",
          firstName: c.firstName,
          lastName: c.lastName,
          companyName: c.companyName,
          tradingName: (c as { tradingName?: string | null }).tradingName ?? null,
          registrationNumber:
            (c as { registrationNumber?: string | null }).registrationNumber ?? null,
          businessNature:
            (c as { businessNature?: string | null }).businessNature ?? null,
          contactPersonTitle:
            (c as { contactPersonTitle?: string | null }).contactPersonTitle ??
            null,
          phone: c.phone,
          email: c.email,
          idType: (c as { idType?: string | null }).idType ?? null,
          idNumber: c.idNumber ?? null,
          taxPin: c.taxPin ?? null,
          dateOfBirth: c.dateOfBirth ? String(c.dateOfBirth) : null,
          gender: (c.gender as "MALE" | "FEMALE" | "OTHER" | null) ?? null,
          address: c.address ?? null,
          city: (c as { city?: string | null }).city ?? null,
          county: (c as { county?: string | null }).county ?? null,
          postalCode: (c as { postalCode?: string | null }).postalCode ?? null,
          occupation: (c as { occupation?: string | null }).occupation ?? null,
          employer: (c as { employer?: string | null }).employer ?? null,
          emergencyContact: c.emergencyContact ?? null,
          emergencyPhone: c.emergencyPhone ?? null,
          allowCredit: Boolean((c as { allowCredit?: boolean }).allowCredit),
          creditLimit: Number(c.creditLimit ?? 0),
          creditTermsDays:
            (c as { creditTermsDays?: number | null }).creditTermsDays ?? 30,
          creditNotes: (c as { creditNotes?: string | null }).creditNotes ?? null,
          loyaltyPoints: Number((c as { loyaltyPoints?: number }).loyaltyPoints ?? 0),
          active: c.active !== false,
        }))}
      />
    </div>
  );
}
