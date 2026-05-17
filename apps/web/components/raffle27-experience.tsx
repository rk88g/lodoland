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
  whatsappHref: string | null;
  receiptHref: string | null;
  transferInstructions: string;
};

function padUnit(value: number) {
  return value.toString().padStart(2, "0");
}

function buildCountdown(targetDate: string) {
  const now = Date.now();
  const diff = Math.max(0, new Date(targetDate).getTime() - now);
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
    const maxFrames = 22;
    const intervalId = window.setInterval(() => {
      frame += 1;
      if (frame >= maxFrames) {
        setDisplayedNumber(luckyNumber);
        window.clearInterval(intervalId);
        return;
      }

      setDisplayedNumber(Math.floor(Math.random() * 1500) + 1);
    }, 80);

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
      <Stack spacing={3}>
        <Stack spacing={1.25}>
          <Chip
            className="raffle27-chip"
            label={countdown.finished ? "La tombola ya cerro" : "Tu suerte se congela por 72 horas"}
            sx={{ alignSelf: "flex-start" }}
          />
          <Typography className="raffle27-title" variant="h1">
            RIFA 27 MAYO 2026
          </Typography>
          <Typography className="raffle27-subtitle">
            Una tombola digital que guarda tu suerte, aparta tu numero por 30 minutos y te acompaña hasta cerrar la rifa.
          </Typography>
        </Stack>

        <Box className="raffle27-countdown">
          <Typography className="raffle27-countdown-label">Cuenta regresiva oficial</Typography>
          <Box className="raffle27-countdown-grid">
            <CountdownCell label="Dias" value={padUnit(countdown.days)} />
            <CountdownCell label="Horas" value={padUnit(countdown.hours)} />
            <CountdownCell label="Minutos" value={padUnit(countdown.minutes)} />
            <CountdownCell label="Segundos" value={padUnit(countdown.seconds)} />
          </Box>
        </Box>

        <Box className="raffle27-stage">
          <Box className="raffle27-stage-drum">
            <Typography className="raffle27-stage-label">Numero de la suerte</Typography>
            <Typography className="raffle27-stage-number">{formattedLuckyNumber}</Typography>
            <Typography className="raffle27-stage-message">{message}</Typography>
            {holdCountdown ? (
              <Typography className="raffle27-stage-hold">
                Tu apartado exclusivo vence en {holdCountdown}. Despues de eso alguien mas podria comprarlo.
              </Typography>
            ) : (
              <Typography className="raffle27-stage-hold raffle27-stage-hold--warning">
                Si no pagaste a tiempo, otra persona puede adquirir ese numero y tu suerte se movera al siguiente disponible.
              </Typography>
            )}
          </Box>

          <Stack className="raffle27-stage-side" spacing={1.5}>
            <StatCard label="Vendidos" value={soldCount.toString()} />
            <StatCard label="Disponibles" value={availableCount.toString()} />
            <Typography className="raffle27-whatsapp">WhatsApp ventas: +52 331 545 7641</Typography>
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} useFlexGap flexWrap="wrap">
          {whatsappHref ? (
            <Button className="raffle27-primary-action" component="a" href={whatsappHref} rel="noreferrer" target="_blank" variant="contained">
              Pagar por WhatsApp
            </Button>
          ) : null}
          <Button className="raffle27-secondary-action" onClick={() => setShowTransferInfo((current) => !current)} variant="outlined">
            Informacion de transferencia
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
            <Typography color="text.secondary">
              {transferInstructions}
            </Typography>
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
