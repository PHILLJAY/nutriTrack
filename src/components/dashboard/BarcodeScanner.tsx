"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScanBarcode, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface BarcodeScannerProps {
  onSuccess: () => void;
}

type ScanState = "idle" | "scanning" | "found" | "logging" | "error" | "not-found";

export function BarcodeScanner({ onSuccess }: BarcodeScannerProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ScanState>("idle");
  const [productName, setProductName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    await stopScanner();
    setState("logging");
    setErrorMsg("");

    try {
      const res = await fetch("/api/meals/barcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode }),
      });

      if (res.ok) {
        const data = await res.json();
        setProductName(data.product?.name || "Scanned food");
        setState("found");
        onSuccess();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to log food");
        setState("not-found");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }, [stopScanner, onSuccess]);

  const startScanner = useCallback(async () => {
    setState("scanning");
    setErrorMsg("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Wait a tick for the DOM element to be ready
      await new Promise((r) => setTimeout(r, 100));

      if (!containerRef.current) return;

      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {} // ignore scan errors (no barcode found yet)
      );
    } catch (err: any) {
      console.error("Scanner error:", err);
      setErrorMsg("Could not access camera. Please allow camera permissions.");
      setState("error");
    }
  }, [handleBarcodeDetected]);

  const handleOpen = async () => {
    setOpen(true);
    setState("idle");
    setProductName("");
    setErrorMsg("");
  };

  const handleClose = async () => {
    await stopScanner();
    setOpen(false);
    setState("idle");
  };

  const handleScanAgain = async () => {
    setState("idle");
    setProductName("");
    setErrorMsg("");
    // Small delay then restart
    setTimeout(() => startScanner(), 100);
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={handleOpen}>
        <ScanBarcode className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Scan</span>
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {state === "scanning" ? "Scanning..." : 
               state === "found" ? "Food Logged!" :
               state === "not-found" ? "Product Not Found" :
               state === "error" ? "Error" :
               "Scan Barcode"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Scanner viewport */}
            {state === "scanning" && (
              <div className="relative">
                <div
                  id="barcode-reader"
                  ref={containerRef}
                  className="w-full rounded-xl overflow-hidden [&_video]:rounded-xl"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-lime/60 rounded-xl" />
                </div>
              </div>
            )}

            {/* Idle state */}
            {state === "idle" && (
              <div className="text-center py-8">
                <ScanBarcode className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Point your camera at a food barcode to log it instantly.
                </p>
                <Button onClick={startScanner}>
                  Start Scanning
                </Button>
              </div>
            )}

            {/* Logging in progress */}
            {state === "logging" && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto text-lime animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">
                  Looking up product...
                </p>
              </div>
            )}

            {/* Success */}
            {state === "found" && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-lime mb-3" />
                <p className="font-medium mb-1">{productName}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Meal logged successfully!
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleScanAgain}>
                    Scan Another
                  </Button>
                  <Button onClick={handleClose}>Done</Button>
                </div>
              </div>
            )}

            {/* Not found / Error */}
            {(state === "not-found" || state === "error") && (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
                <p className="text-sm text-destructive mb-4">
                  {errorMsg}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleScanAgain}>
                    Try Again
                  </Button>
                  <Button onClick={handleClose}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}