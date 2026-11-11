/**
 * Phase H — OCR / vision extract product lists from a photo.
 * Output feeds Phase D parseProductPasteText → draft → bulk create.
 */

import {
  formatProductPasteDraftMessage,
  parseProductPasteText,
  productPasteDraftActions,
  type ProductPasteDraft,
  type ProductPasteDraftLine,
} from "./product-paste-draft";
import { categoryRepository } from "@/repositories/inventory/categories.repository";

const OCR_SYSTEM = `You extract product catalogue lines from photos of handwritten lists, printed invoices, packing lists, or shelf labels.
Return ONLY plain text, one product per line, no markdown, no commentary.
Preferred formats:
- Name, cost, sell
- Name, sell
- SKU, Name, cost, sell
- Name only
Use numbers without currency symbols when possible. Skip headers and totals. Max 80 lines.`;

export type ProductOcrResult = {
  success: boolean;
  message: string;
  rawText?: string;
  draft?: ProductPasteDraft;
};

async function callVisionOcr(opts: {
  url: string;
  apiKey: string;
  model: string;
  dataUrl: string;
  label: string;
}): Promise<{ text: string | null; error?: string }> {
  try {
    const res = await fetch(opts.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model,
        temperature: 0.1,
        max_tokens: 1200,
        messages: [
          { role: "system", content: OCR_SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract every product line from this image for a shop catalogue import.",
              },
              {
                type: "image_url",
                image_url: { url: opts.dataUrl },
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        text: null,
        error: `${opts.label} ${res.status}: ${errText.slice(0, 180)}`,
      };
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim() || null;
    if (!text) return { text: null, error: `${opts.label}: empty OCR` };
    return { text };
  } catch (e) {
    return {
      text: null,
      error: `${opts.label}: ${e instanceof Error ? e.message : "network error"}`,
    };
  }
}

/**
 * Run vision OCR then Phase D paste parser + category attachment.
 */
export async function extractProductDraftFromImage(opts: {
  businessId: string;
  /** data:image/jpeg;base64,... or raw base64 + mime */
  dataUrl: string;
}): Promise<ProductOcrResult> {
  let dataUrl = opts.dataUrl.trim();
  if (!dataUrl.startsWith("data:")) {
    return {
      success: false,
      message: "Invalid image payload.",
    };
  }
  // rough size guard (~4MB base64)
  if (dataUrl.length > 5_500_000) {
    return {
      success: false,
      message: "Image too large. Use a clearer photo under ~4MB.",
    };
  }

  const errors: string[] = [];
  let rawText: string | null = null;

  const xaiKey =
    process.env.XAI_API_KEY?.trim() ||
    process.env.GROK_API_KEY?.trim() ||
    process.env.XAI_KEY?.trim();
  if (xaiKey) {
    const models = [
      process.env.XAI_VISION_MODEL?.trim(),
      process.env.XAI_MODEL?.trim(),
      "grok-2-vision-1212",
      "grok-2-vision",
      "grok-vision-beta",
    ].filter((m, i, a): m is string => Boolean(m) && a.indexOf(m) === i);

    for (const model of models) {
      const attempt = await callVisionOcr({
        url: "https://api.x.ai/v1/chat/completions",
        apiKey: xaiKey,
        model,
        dataUrl,
        label: `xai-vision:${model}`,
      });
      if (attempt.text) {
        rawText = attempt.text;
        break;
      }
      if (attempt.error) errors.push(attempt.error);
    }
  }

  if (!rawText) {
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (groqKey) {
      const models = [
        process.env.GROQ_VISION_MODEL?.trim(),
        "meta-llama/llama-4-scout-17b-16e-instruct",
        "llama-3.2-90b-vision-preview",
        "llama-3.2-11b-vision-preview",
      ].filter((m, i, a): m is string => Boolean(m) && a.indexOf(m) === i);

      for (const model of models) {
        const attempt = await callVisionOcr({
          url: "https://api.groq.com/openai/v1/chat/completions",
          apiKey: groqKey,
          model,
          dataUrl,
          label: `groq-vision:${model}`,
        });
        if (attempt.text) {
          rawText = attempt.text;
          break;
        }
        if (attempt.error) errors.push(attempt.error);
      }
    }
  }

  if (!rawText) {
    return {
      success: false,
      message:
        errors[0] ||
        "Could not read the image. Set XAI_API_KEY or GROQ_API_KEY with a vision model, or paste the list as text.",
    };
  }

  // Strip accidental markdown fences
  const cleaned = rawText
    .replace(/^```[\w]*\n?/gm, "")
    .replace(/```$/gm, "")
    .trim();

  const cats = await categoryRepository.findAll(opts.businessId).catch(() => []);
  const categoryId = cats[0]?.id ?? null;
  const categoryName = cats[0]?.name ?? null;
  const parsed = parseProductPasteText(cleaned);

  const draft: ProductPasteDraft = {
    lines: parsed.lines,
    skipped: parsed.skipped,
    categoryId,
    categoryName,
  };

  if (draft.lines.length === 0) {
    return {
      success: false,
      message:
        "Image was read but no product lines were recognised. Try a clearer photo or paste text.\n\n" +
        `OCR text preview:\n${cleaned.slice(0, 400)}`,
      rawText: cleaned,
    };
  }

  return {
    success: true,
    message: formatProductPasteDraftMessage(draft),
    rawText: cleaned,
    draft,
  };
}

export function productOcrActions(draft: ProductPasteDraft) {
  return productPasteDraftActions(draft);
}

export type { ProductPasteDraftLine };
