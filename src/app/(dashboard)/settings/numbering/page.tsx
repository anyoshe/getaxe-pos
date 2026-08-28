import { getCurrentUser } from "@/lib/auth/current-user";
import { numberingSequencesRepository } from "@/repositories/settings/numbering-sequences.repository";
import { numberingSequencesService } from "@/features/settings/services/numbering-sequences.service";
import { branchesRepository } from "@/repositories/settings/branches.repository";
import { NumberingClient } from "@/features/settings/components/numbering-client";

export default async function NumberingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const branches = await branchesRepository.findAll(user.businessId).catch(() => []);
  const branch = branches.find((b) => b.isHeadOffice) ?? branches[0];
  if (branch) {
    await numberingSequencesService
      .createDefaultSequences(user.businessId, branch.id)
      .catch(() => undefined);
  }

  const sequences = await numberingSequencesRepository
    .findAll(user.businessId)
    .catch(() => []);

  return (
    <NumberingClient
      sequences={sequences.map((s) => ({
        id: s.id,
        documentType: String(s.documentType),
        prefix: s.prefix,
        nextNumber: s.nextNumber,
        numberLength: s.numberLength,
        separator: s.separator ?? "-",
        active: s.active,
      }))}
    />
  );
}
