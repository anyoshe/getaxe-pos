"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
  "How is my business doing today?",
  "What should I restock?",
  "What is making me profit this month?",
  "What products am I selling at a loss?",
  "Where is my money tied up?",
  "What needs my attention?",
];

export function BusinessAdvisorChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "I’m your GetAxe business advisor. Ask about sales, stock, profit, cash, or what to do next — I’ll use your live numbers.",
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
          "bg-primary text-primary-foreground hover:opacity-95",
          "ring-2 ring-primary/30",
        )}
        aria-label={open ? "Close advisor" : "Open business advisor"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open ? (
        <div
          className={cn(
            "fixed bottom-24 right-3 z-50 flex w-[min(100vw-1.5rem,24rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
            "sm:right-5 max-h-[min(70dvh,32rem)]",
          )}
        >
          <div className="flex items-center gap-2 border-b border-border bg-primary/10 px-4 py-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Business advisor
              </p>
              <p className="text-[11px] text-muted-foreground">
                Decide with your live numbers
                {remaining != null ? ` · ${remaining} free today` : ""}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-6 bg-primary text-primary-foreground"
                    : "mr-2 bg-muted/80 text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.actions && msg.actions.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.actions.map((a) => (
                      <Link
                        key={a.href + a.label}
                        href={a.href}
                        className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/10"
                        onClick={() => setOpen(false)}
                      >
                        {a.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {pending ? (
              <p className="text-xs text-muted-foreground">Thinking…</p>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-2">
            <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending}
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
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
                placeholder="Ask about your business…"
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                disabled={pending}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-xl"
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
