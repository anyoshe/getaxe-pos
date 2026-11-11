/**
 * Phase A — setup coaching from readiness + business type.
 * Proposes next steps and vertical packs; does not write data by itself.
 */

import type { GoLiveVertical } from "@/features/settings/lib/go-live-day";
import { resolveGoLiveVertical } from "@/features/settings/lib/go-live-day";
import { VERTICAL_PACKS } from "@/features/settings/lib/vertical-pack";
import type { SetupCheck } from "@/features/settings/services/setup-readiness.service";

export type SetupCoachSnapshot = {
  businessName: string | null;
  businessType: string | null;
  vertical: GoLiveVertical;
  verticalLabel: string;
  score: number;
  requiredDone: number;
  requiredTotal: number;
  incomplete: SetupCheck[];
  next: SetupCheck | null;
  isSetupComplete: boolean;
};

export function buildSetupCoachSnapshot(input: {
  businessName: string | null;
  businessType: string | null;
  score: number;
  requiredDone: number;
  requiredTotal: number;
  checks: SetupCheck[];
}): SetupCoachSnapshot {
  const vertical = resolveGoLiveVertical(input.businessType);
  const pack = VERTICAL_PACKS.find((p) => p.vertical === vertical);
  const incomplete = input.checks
    .filter((c) => !c.done && !c.optional)
    .sort((a, b) => a.priority - b.priority);
  const next = incomplete[0] ?? null;
  const isSetupComplete =
    input.requiredTotal > 0
      ? input.requiredDone >= input.requiredTotal
      : incomplete.length === 0;

  return {
    businessName: input.businessName,
    businessType: input.businessType,
    vertical,
    verticalLabel: pack?.label ?? vertical,
    score: input.score,
    requiredDone: input.requiredDone,
    requiredTotal: input.requiredTotal,
    incomplete,
    next,
    isSetupComplete,
  };
}

export function setupWelcomeMessage(s: SetupCoachSnapshot): string {
  const name = s.businessName?.trim() || "your shop";
  if (s.isSetupComplete) {
    return (
      `**${name}** looks set up for day-to-day use ` +
      `(readiness ~${s.score}%). Ask about sales, stock, cash, or margins — ` +
      `or say **go live** anytime to review the checklist.`
    );
  }

  const typeLine = s.businessType
    ? `I see this business as **${s.verticalLabel}** (${s.businessType}).`
    : `Business type is not clear yet — pick a vertical pack so GetAxe loads the right defaults.`;

  const nextLine = s.next
    ? `**Next step:** ${s.next.label}` +
      (s.next.description ? ` — ${s.next.description}` : "") +
      `.`
    : `Open **Go live in 1 day** to finish remaining items.`;

  const packHint =
    !s.businessType || s.incomplete.some((c) => c.id === "caps" || c.id === "products")
      ? `\n\nI can **apply a vertical pack** (capabilities + starter catalogue path) for pharmacy, hardware, agrovet, spares, or general retail — confirm with a button or say e.g. “apply pharmacy defaults”.`
      : "";

  return (
    `Welcome — I’ll help finish setup for **${name}**.\n\n` +
    `${typeLine}\n` +
    `Readiness **${s.requiredDone}/${s.requiredTotal}** required checks (~${s.score}%).\n\n` +
    `${nextLine}` +
    packHint
  );
}

export function setupWelcomeActions(s: SetupCoachSnapshot): {
  label: string;
  href?: string;
  /** Client runs applyVerticalPack when set */
  applyVertical?: GoLiveVertical;
}[] {
  const actions: {
    label: string;
    href?: string;
    applyVertical?: GoLiveVertical;
  }[] = [];

  if (!s.isSetupComplete) {
    actions.push({
      label: "Go live in 1 day",
      href: "/settings/go-live",
    });
    if (s.next) {
      actions.push({ label: s.next.label, href: s.next.href });
    }
    // Offer current vertical + common alternatives when still early
    if (s.requiredDone < s.requiredTotal) {
      const primary = VERTICAL_PACKS.find((p) => p.vertical === s.vertical);
      if (primary) {
        actions.push({
          label: `Apply ${primary.label} defaults`,
          applyVertical: primary.vertical,
        });
      }
      for (const p of VERTICAL_PACKS) {
        if (p.vertical === s.vertical) continue;
        if (actions.length >= 6) break;
        actions.push({
          label: `Use ${p.label} pack`,
          applyVertical: p.vertical,
        });
      }
    }
  } else {
    actions.push({ label: "Dashboard", href: "/dashboard" });
    actions.push({ label: "Open POS", href: "/sales/pos" });
  }

  return actions;
}

/** Detect “apply pharmacy defaults” style intents from free text. */
export function parseApplyVerticalIntent(
  question: string,
): GoLiveVertical | null {
  const q = question.toLowerCase().trim();
  if (
    !/(apply|load|use|set\s*up|setup|enable|install)/.test(q) &&
    !/(defaults|pack|vertical|starter)/.test(q)
  ) {
    // still allow "make this a pharmacy"
    if (!/(pharmacy|hardware|agrovet|spares|garage|retail|chemist)/.test(q)) {
      return null;
    }
    if (!/(make|set|change|switch|i\s*am|we're|we are|this is)/.test(q)) {
      return null;
    }
  }

  if (/pharm|chemist|clinic|dispens/.test(q)) return "pharmacy";
  if (/hardware|building|cement|paint/.test(q)) return "hardware";
  if (/agro|vet|farm|seed|fertiliz/.test(q)) return "agrovet";
  if (/spare|garage|motorbike|auto\s*part|tyre/.test(q)) return "spares";
  if (/general|retail|duka|shop|supermarket/.test(q)) return "general";
  return null;
}

export function setupAwareSystemAddendum(s: SetupCoachSnapshot): string {
  if (s.isSetupComplete) {
    return (
      "Setup is complete enough to trade. Prefer operational advice " +
      "(sales, stock, cash). Mention go-live only if asked."
    );
  }
  const gaps = s.incomplete
    .slice(0, 6)
    .map((c) => `${c.id}:${c.label}`)
    .join(", ");
  return (
    `SETUP MODE: readiness ${s.requiredDone}/${s.requiredTotal} (~${s.score}%). ` +
    `Vertical=${s.vertical} type=${s.businessType ?? "unset"}. ` +
    `Incomplete: ${gaps || "none"}. ` +
    `Always state the single next step and offer Go live (/settings/go-live). ` +
    `If they want defaults for a vertical, tell them to confirm the pack button or say “apply pharmacy defaults” (etc.). ` +
    `Do not invent menu paths — use real GetAxe routes only.`
  );
}
