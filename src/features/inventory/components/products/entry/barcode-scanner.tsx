"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose?: () => void;
  continuous?: boolean;
}

export function BarcodeScanner({ onScan, onClose, continuous = false }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(true);
  const lastCodeRef = useRef("");

  const stop = useCallback(() => {
    try { controlsRef.current?.stop(); } catch { /* ignore */ }
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    async function start() {
      try {
        if (!videoRef.current) return;
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (cancelled || !result) return;
          const text = result.getText().trim();
          if (!text || text === lastCodeRef.current) return;
          lastCodeRef.current = text;
          onScan(text);
          if (!continuous) { stop(); onClose?.(); }
          else {
            window.setTimeout(() => { if (lastCodeRef.current === text) lastCodeRef.current = ""; }, 1500);
          }
        });
        if (cancelled) { controls.stop(); return; }
        controlsRef.current = controls;
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Camera unavailable. Enter the code manually.");
          setScanning(false);
        }
      }
    }
    void start();
    return () => { cancelled = true; stop(); };
  }, [continuous, onClose, onScan, stop]);

  function submitManual() {
    const code = manualCode.trim();
    if (!code) return;
    onScan(code);
    if (!continuous) onClose?.();
    setManualCode("");
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border bg-black">
        <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitManual(); } }}
          placeholder="Or type barcode / SKU / QR value"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Button type="button" onClick={submitManual}>Use</Button>
      </div>
      <div className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          {scanning ? (continuous ? "Scanning continuously…" : "Point camera at barcode or QR") : "Scanner idle"}
        </p>
        {onClose && (
          <Button type="button" variant="outline" size="sm" onClick={() => { stop(); onClose(); }}>Close</Button>
        )}
      </div>
    </div>
  );
}
