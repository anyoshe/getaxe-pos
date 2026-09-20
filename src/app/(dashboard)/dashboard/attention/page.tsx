import { getAttentionBundleAction } from "@/features/dashboard/actions/attention-actions";
import { AttentionCenter } from "@/features/dashboard/components/attention-center";

export const dynamic = "force-dynamic";

const KINDS = new Set([
  "restock",
  "expiry",
  "receivable",
  "payable",
  "slow",
  "expense",
]);

export default async function AttentionPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }> | { kind?: string };
}) {
  const sp = await Promise.resolve(searchParams);
  const kind = KINDS.has(sp.kind ?? "") ? (sp.kind as string) : "restock";
  const res = await getAttentionBundleAction(kind);
  if (!res.success) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Could not load attention items.
      </div>
    );
  }
  return <AttentionCenter kind={kind} initial={res.data} />;
}
