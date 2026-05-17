"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Collapse, Stack, Typography } from "@mui/material";

type Raffle27ExperienceProps = {
  countdownEndsAt: string;
  holdExpiresAt: string | null;
  luckyNumber: number | null;
  message: string;
  soldCount: number;
  availableCount: number;
  totalCount: number;
  whatsappHref: string | null;
  receiptHref: string | null;
  transferInstructions: string;
};

function padUnit(value: number) {
  return value.toString().padStart(2, "0");
}

function buildCountdown(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return {
    days,
    hours,
    minutes,
    seconds,
    finished: diff <= 0
  };
}

function buildRemainingHold(targetDate: string | null) {
  if (!targetDate) {
    return null;
  }

  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    return null;
  }

  const minutes = Math.floor(diff / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return `${padUnit(minutes)}:${padUnit(seconds)}`;
}

export function Raffle27Experience({
  countdownEndsAt,
  holdExpiresAt,
  luckyNumber,
  message,
  soldCount,
  availableCount,
  totalCount,
  whatsappHref,
  receiptHref,
  transferInstructions
}: Raffle27ExperienceProps) {
  const [displayedNumber, setDisplayedNumber] = useState<number | null>(luckyNumber);
  const [countdown, setCountdown] = useState(() => buildCountdown(countdownEndsAt));
  const [holdCountdown, setHoldCountdown] = useState(() => buildRemainingHold(holdExpiresAt));
  const [showTransferInfo, setShowTransferInfo] = useState(false);

  useEffect(() => {
    setCountdown(buildCountdown(countdownEndsAt));
    const intervalId = window.setInterval(() => {
      setCountdown(buildCountdown(countdownEndsAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [countdownEndsAt]);

  useEffect(() => {
    setHoldCountdown(buildRemainingHold(holdExpiresAt));
    if (!holdExpiresAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setHoldCountdown(buildRemainingHold(holdExpiresAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [holdExpiresAt]);

  useEffect(() => {
    if (!luckyNumber) {
      setDisplayedNumber(null);
      return;
    }

    let frame = 0;
    const maxFrames = 30;
    const intervalId = window.setInterval(() => {
      frame += 1;
      if (frame >= maxFrames) {
        setDisplayedNumber(luckyNumber);
        window.clearInterval(intervalId);
        return;
      }

      const highBiasedRoll = Math.floor(1 + Math.pow(Math.random(), 0.42) * 1500);
      setDisplayedNumber(Math.min(1500, highBiasedRoll));
    }, 58);

    return () => window.clearInterval(intervalId);
  }, [luckyNumber]);

  const formattedLuckyNumber = useMemo(() => {
    if (!displayedNumber) {
      return "----";
    }

    return displayedNumber.toString().padStart(4, "0");
  }, [displayedNumber]);

  return (
    <Box className="raffle27-shell">
      <Box className="raffle27-orbit" />
      <Box className="raffle27-scanline" />

      <Stack spacing={2.5}>
        <Box className="raffle27-hero-grid">
          <Stack className="raffle27-copy" spacing={1.35}>
            <Chip
              className="raffle27-chip"
              label={countdown.finished ? "Tombola cerrada" : "Suerte bloqueada por 72 horas"}
              sx={{ alignSelf: "flex-start" }}
            />
            <Typography className="raffle27-title" variant="h1">
              RIFA 27 MAYO 2026
            </Typography>
            <Typography className="raffle27-subtitle">
              El sistema gira, aparta tu numero y conserva tu suerte. Si dejas pasar el pago, el siguiente disponible toma el relevo.
            </Typography>
            <Box aria-hidden="true" className="raffle27-mini-feed">
              <span>1098</span>
              <span>1327</span>
              <span>0744</span>
              <span>1489</span>
              <span>1166</span>
              <span>0931</span>
            </Box>
          </Stack>

          <Box className="raffle27-machine">
            <Box className="raffle27-machine-ring" />
            <Box className="raffle27-machine-core">
              <Typography className="raffle27-stage-label">Numero asignado</Typography>
              <Typography className="raffle27-stage-number">{formattedLuckyNumber}</Typography>
              <Typography className="raffle27-stage-message">{message}</Typography>
            </Box>
          </Box>
        </Box>

        <Box className="raffle27-command-strip">
          <Box className="raffle27-countdown">
            <Typography className="raffle27-countdown-label">Cierra en</Typography>
            <Box className="raffle27-countdown-grid">
              <CountdownCell label="Dias" value={padUnit(countdown.days)} />
              <CountdownCell label="Horas" value={padUnit(countdown.hours)} />
              <CountdownCell label="Min" value={padUnit(countdown.minutes)} />
              <CountdownCell label="Seg" value={padUnit(countdown.seconds)} />
            </Box>
          </Box>

          <Box className="raffle27-status-rack">
            <StatCard label="Total" value={totalCount.toString()} />
            <StatCard label="Vendidos" value={soldCount.toString()} />
            <StatCard label="Disponibles" value={availableCount.toString()} />
          </Box>
        </Box>

        <Box className="raffle27-hold-panel">
          <Typography className="raffle27-hold-title">
            {holdCountdown ? `Apartado activo: ${holdCountdown}` : "Apartado vencido o pendiente de renovar"}
          </Typography>
          <Typography className={holdCountdown ? "raffle27-stage-hold" : "raffle27-stage-hold raffle27-stage-hold--warning"}>
            {holdCountdown
              ? "Durante este tiempo nadie mas puede comprar tu numero. Despues vuelve a estar disponible si no concretas el pago."
              : "Si alguien mas compra tu numero anterior, tu suerte avanza al siguiente disponible."}
          </Typography>
          <Typography className="raffle27-whatsapp">WhatsApp ventas: +52 331 545 7641</Typography>
        </Box>

        <Stack className="raffle27-action-row" direction={{ xs: "column", md: "row" }} spacing={1.25} useFlexGap flexWrap="wrap">
          {whatsappHref ? (
            <Button className="raffle27-primary-action" component="a" href={whatsappHref} rel="noreferrer" target="_blank" variant="contained">
              Pagar por WhatsApp
            </Button>
          ) : null}
          <Button className="raffle27-secondary-action" onClick={() => setShowTransferInfo((current) => !current)} variant="outlined">
            Transferencia
          </Button>
          {receiptHref ? (
            <Button className="raffle27-secondary-action" component="a" href={receiptHref} rel="noreferrer" target="_blank" variant="outlined">
              Ya pague
            </Button>
          ) : null}
          <Button className="raffle27-secondary-action" component="a" href="/listado27mayo2026/boletos-vendidos" variant="outlined">
            Boletos vendidos
          </Button>
        </Stack>

        <Collapse in={showTransferInfo}>
          <Box className="raffle27-transfer-box">
            <Typography variant="h3">Transferencia / deposito</Typography>
            <Typography color="text.secondary">{transferInstructions}</Typography>
            <Typography className="raffle27-transfer-note">
              En cuanto realices tu pago, usa el boton <strong>Ya pague</strong> y manda tu comprobante por WhatsApp.
            </Typography>
          </Box>
        </Collapse>
      </Stack>
    </Box>
  );
}

function CountdownCell({ label, value }: { label: string; value: string }) {
  return (
    <Box className="raffle27-countdown-cell">
      <Typography className="raffle27-countdown-value">{value}</Typography>
      <Typography className="raffle27-countdown-caption">{label}</Typography>
    </Box>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Box className="raffle27-stat-card">
      <Typography className="raffle27-stat-label">{label}</Typography>
      <Typography className="raffle27-stat-value">{value}</Typography>
    </Box>
  );
}
