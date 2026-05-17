"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Collapse, Typography } from "@mui/material";

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
  const orbitBalls = useMemo(
    () => ["1428", "0887", "1264", "0519", "1399", "1176", "0641", "1500", "1022", "1335"],
    []
  );

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
      <Box className="raffle27-sparks" aria-hidden="true" />
      <Box className="raffle27-poster-copy">
        <Typography className="raffle27-brand">Lodo Land GDL</Typography>
        <Typography className="raffle27-kicker">Rifa entre lodonautas</Typography>
        <Typography className="raffle27-title" variant="h1">
          Gran Rifa
        </Typography>
        <Typography className="raffle27-red-slash">
          3 premios que te cambian el juego
        </Typography>
        <Typography className="raffle27-luck-line">
          Tu suerte esta en el primer numero que elijas
        </Typography>
      </Box>

      <Box className="raffle27-date-badge">
        <strong>27</strong>
        <span>de mayo<br />2026</span>
      </Box>

      <Box className="raffle27-machine" aria-label={`Numero asignado ${formattedLuckyNumber}`}>
        <Box className="raffle27-machine-handle" aria-hidden="true" />
        <Box className="raffle27-machine-ring" />
        <Box className="raffle27-machine-glass" aria-hidden="true" />
        <Box className="raffle27-ball-track" aria-hidden="true">
          {orbitBalls.map((ball, index) => (
            <span className="raffle27-orbit-ball" key={`${ball}-${index}`} style={{ "--ball-index": index } as CSSProperties}>
              <b>{ball}</b>
            </span>
          ))}
        </Box>
        <Box className="raffle27-winning-ball">
          <Typography className="raffle27-stage-label">
            {luckyNumber ? "Tu bola ganadora" : "Tombola lista"}
          </Typography>
          <Typography className="raffle27-stage-number">{formattedLuckyNumber}</Typography>
          <Typography className="raffle27-stage-message">{message}</Typography>
        </Box>
        <Box className="raffle27-machine-base" aria-hidden="true" />
      </Box>

      <Box className="raffle27-countdown">
        <Typography className="raffle27-countdown-label">{countdown.finished ? "Tombola cerrada" : "Termina en"}</Typography>
        <Box className="raffle27-countdown-grid">
          <CountdownCell label="Dias" value={padUnit(countdown.days)} />
          <CountdownCell label="Horas" value={padUnit(countdown.hours)} />
          <CountdownCell label="Min" value={padUnit(countdown.minutes)} />
          <CountdownCell label="Seg" value={padUnit(countdown.seconds)} />
        </Box>
      </Box>

      <Box className="raffle27-stats-line" aria-label="Estado de boletos">
        <StatCard label="Total" value={totalCount.toString()} />
        <StatCard label="Vendidos" value={soldCount.toString()} />
        <StatCard label="Disponibles" value={availableCount.toString()} />
      </Box>

      <Box className="raffle27-hold-ribbon">
        <Typography className="raffle27-hold-title">
          {holdCountdown ? `Apartado activo ${holdCountdown}` : "No cambies tu suerte"}
        </Typography>
        <Typography className={holdCountdown ? "raffle27-stage-hold" : "raffle27-stage-hold raffle27-stage-hold--warning"}>
          {holdCountdown
            ? "Nadie mas puede comprar tu numero durante este tiempo. Pagalo antes de que la suerte se mueva."
            : "Si no lo pagas a tiempo, tu numero puede pasar a otro y tu suerte avanza al siguiente disponible."}
        </Typography>
      </Box>

      <Box className="raffle27-action-row">
        {whatsappHref ? (
          <Button className="raffle27-primary-action" component="a" href={whatsappHref} rel="noreferrer" target="_blank" variant="contained">
            Apartar por WhatsApp
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
      </Box>

      <Collapse className="raffle27-transfer-collapse" in={showTransferInfo}>
        <Box className="raffle27-transfer-box">
          <Typography variant="h3">Transferencia / deposito</Typography>
          <Typography color="text.secondary">{transferInstructions}</Typography>
          <Typography className="raffle27-transfer-note">
            En cuanto realices tu pago, usa el boton <strong>Ya pague</strong> y manda tu comprobante por WhatsApp.
          </Typography>
        </Box>
      </Collapse>

      <Box className="raffle27-howto-line" aria-label="Como participar">
        <span>1. Compra ahora</span>
        <span>2. Tu numero lo elige la suerte</span>
        <span>3. Apartalo por WhatsApp</span>
        <span>4. Pagas la cantidad que te toco</span>
      </Box>

      <Box className="raffle27-contact-strip">
        <span>www.lodoland.mx/listado27mayo2026</span>
        <strong>WhatsApp +52 331 545 7641</strong>
      </Box>
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
      <Typography className="raffle27-stat-value">{value}</Typography>
      <Typography className="raffle27-stat-label">{label}</Typography>
    </Box>
  );
}
