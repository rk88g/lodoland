"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";

type TicketQrScannerProps = {
  inputId: string;
  formId?: string;
};

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): {
        detect(source: ImageBitmapSource): Promise<Array<{ rawValue?: string }>>;
      };
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

export function TicketQrScanner({ inputId, formId }: TicketQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const available = typeof window !== "undefined" && "BarcodeDetector" in window && "mediaDevices" in navigator;
    setSupported(Boolean(available));
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setActive(false);
  };

  const scanFrame = async (detector: InstanceType<NonNullable<typeof window.BarcodeDetector>>) => {
    const video = videoRef.current;

    if (!video || video.readyState < 2) {
      frameRef.current = requestAnimationFrame(() => void scanFrame(detector));
      return;
    }

    try {
      const results = await detector.detect(video);
      const value = results.find((result) => result.rawValue)?.rawValue;

      if (value) {
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        if (input) {
          input.value = value;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }

        stopScanner();

        if (formId) {
          const form = document.getElementById(formId) as HTMLFormElement | null;
          form?.requestSubmit();
        }
        return;
      }
    } catch (_error) {
      setError("No pudimos leer el QR en este momento.");
      stopScanner();
      return;
    }

    frameRef.current = requestAnimationFrame(() => void scanFrame(detector));
  };

  const startScanner = async () => {
    setError(null);

    if (!window.BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no soporta lector QR con camara.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      setActive(true);
      frameRef.current = requestAnimationFrame(() => void scanFrame(detector));
    } catch (_error) {
      setError("No pudimos abrir la camara para leer el QR.");
      stopScanner();
    }
  };

  if (supported === false) {
    return (
      <Alert severity="info">
        Este navegador no soporta lector QR con camara. Aun puedes escanear con la camara del telefono y abrir la URL del ticket.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button onClick={() => void startScanner()} type="button" variant="outlined">
          Abrir camara
        </Button>
        {active ? (
          <Button color="inherit" onClick={stopScanner} type="button" variant="outlined">
            Detener lector
          </Button>
        ) : null}
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {active ? (
        <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 1.5 }}>
          <video ref={videoRef} style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover" }} />
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Apunta al QR del ticket. Cuando se detecte, se validara automaticamente.
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}
