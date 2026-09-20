"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  askAdvisorAction,
  getAdvisorQuotaAction,
} from "../actions/ask-advisor";

type Msg = {
  role: "user" | "assistant";
  text: string;
  actions?: { label: string; href: string }[];
  provider?: string;
};

const SUGGESTIONS = [
  "How is my business doing?",
  "What should I restock?",
  "What is making profit?",
  "Any products at a loss?",
  "Where is my money tied up?",
  "What needs my attention?",
];

/** Inline **bold** and plain text */
function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong
          key={i}
          className="font-semibold text-foreground dark:text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/** Turn advisor text into readable blocks: paragraphs, numbered steps, bullets */
function AdvisorMessageBody({ text }: { text: string }) {
  const lines = text.split(/\n/);
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let listItems: { kind: "ol" | "ul"; text: string }[] = [];
  let key = 0;

  const flushPara = () => {
    if (!para.length) return;
    const body = para.join(" ").trim();
    if (body) {
      blocks.push(
        <p key={key++} className="text-[13px] leading-relaxed text-foreground/90">
          {formatInline(body)}
        </p>,
      );
    }
    para = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    const kind = listItems[0].kind;
    const items = listItems.map((it) => it.text);
    if (kind === "ol") {
      blocks.push(
        <ol
          key={key++}
          className="my-2 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed marker:font-semibold marker:text-primary"
        >
          {items.map((it, i) => (
            <li key={i} className="pl-1">
              {formatInline(it)}
            </li>
          ))}
        </ol>,
      );
    } else {
      blocks.push(
        <ul
          key={key++}
          className="my-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed marker:text-primary"
        >
          {items.map((it, i) => (
            <li key={i} className="pl-1">
              {formatInline(it)}
            </li>
          ))}
        </ul>,
      );
    }
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushPara();
      continue;
    }
    // Numbered: "1. **Title**" or "1. text"
    const num = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (num) {
      flushPara();
      if (listItems.length && listItems[0].kind !== "ol") flushList();
      listItems.push({ kind: "ol", text: num[2] });
      continue;
    }
    // Bullets
    if (/^[-•*]\s+/.test(trimmed)) {
      flushPara();
      if (listItems.length && listItems[0].kind !== "ul") flushList();
      listItems.push({ kind: "ul", text: trimmed.replace(/^[-•*]\s+/, "") });
      continue;
    }
    // Arrow action lines under a priority
    if (/^→\s+/.test(trimmed) || /^->\s+/.test(trimmed)) {
      flushPara();
      if (listItems.length) {
        // append to last list item as sub-line
        const last = listItems[listItems.length - 1];
        last.text += "\n" + trimmed.replace(/^(→|->)\s+/, "→ ");
      } else {
        para.push(trimmed);
      }
      continue;
    }
    // Markdown heading-ish **Priorities...**
    if (/^\*\*.+\*\*$/.test(trimmed) && trimmed.length < 80) {
      flushList();
      flushPara();
      blocks.push(
        <p
          key={key++}
          className="mt-2 text-sm font-bold tracking-tight text-primary"
        >
          {trimmed.slice(2, -2)}
        </p>,
      );
      continue;
    }
    flushList();
    para.push(trimmed);
  }
  flushList();
  flushPara();

  return <div className="space-y-2">{blocks}</div>;
}

export function BusinessAdvisorChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "I’m your **GetAxe business advisor**. Ask about sales, stock, profit, cash, or what to do next — I’ll use your **live numbers** and suggest clear next steps.",
    },
  ]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAdvisorQuotaAction()
      .then((r) => setRemaining(r.remainingToday))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function send(q: string) {
    const question = q.trim();
    if (!question || pending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    start(async () => {
      const res = await askAdvisorAction(question);
      if (!res.success) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: res.message || "Could not answer right now.",
          },
        ]);
        return;
      }
      setRemaining(res.data.remainingToday);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: res.data.answer,
          actions: res.data.actions,
          provider: res.data.provider,
        },
      ]);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition",
          "bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white",
          "ring-2 ring-indigo-400/40 hover:scale-105 hover:shadow-xl",
        )}
        aria-label={open ? "Close advisor" : "Open business advisor"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open ? (
        <div
          className={cn(
            "fixed bottom-24 right-3 z-50 flex w-[min(100vw-1.5rem,26rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl",
            "border-indigo-500/20 bg-card sm:right-5 max-h-[min(72dvh,34rem)]",
          )}
        >
          <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold tracking-tight">
                Business advisor
              </p>
              <p className="text-[11px] text-white/85">
                Know · Control · Decide · Grow
                {remaining != null ? ` · ${remaining} free today` : ""}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-indigo-500/5 to-transparent p-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 shadow-sm",
                  msg.role === "user"
                    ? "ml-8 bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                    : "mr-1 border border-indigo-500/15 bg-card text-foreground",
                )}
              >
                {msg.role === "assistant" ? (
                  <AdvisorMessageBody text={msg.text} />
                ) : (
                  <p className="text-[13px] leading-relaxed">{msg.text}</p>
                )}
                {msg.provider && msg.role === "assistant" ? (
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-indigo-600/70 dark:text-cyan-400/80">
                    {msg.provider === "xai"
                      ? "Grok · live data"
                      : msg.provider === "groq"
                        ? "Groq · live data"
                        : msg.provider === "heuristic"
                          ? "Coach · live data"
                          : msg.provider}
                  </p>
                ) : null}
                {msg.actions && msg.actions.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
                    {msg.actions.map((a) => (
                      <Link
                        key={a.href + a.label}
                        href={a.href}
                        className="rounded-full bg-gradient-to-r from-indigo-600/10 to-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-500/25 hover:from-indigo-600/20 hover:to-cyan-500/20 dark:text-cyan-300"
                        onClick={() => setOpen(false)}
                      >
                        {a.label} →
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {pending ? (
              <p className="px-1 text-xs font-medium text-indigo-600/80 dark:text-cyan-400/80">
                Reviewing your live numbers…
              </p>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border/80 bg-muted/30 p-2.5">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending}
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full border border-indigo-500/20 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your advisor…"
                className="min-w-0 flex-1 rounded-xl border border-indigo-500/20 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
                disabled={pending}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:opacity-95"
                disabled={pending || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
