"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Collapse, Typography } from "@mui/material";
import { Raffle27TombolaCanvas } from "./raffle27-tombola-canvas";

type Raffle27ExperienceProps = {
  countdownEndsAt: string;
  holdExpiresAt: string | null;
  luckyNumber: number | null;
  message: string;
  soldCount?: number;
  availableCount?: number;
  totalCount?: number;
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

function formatTransferInstructions(value: string) {
  return value.replace(/\\n/g, "\n");
}

export function Raffle27Experience({
  countdownEndsAt,
  holdExpiresAt,
  luckyNumber,
  message,
  receiptHref,
  transferInstructions
}: Raffle27ExperienceProps) {
  const actionRowRef = useRef<HTMLDivElement | null>(null);
  const transferButtonRef = useRef<HTMLButtonElement | null>(null);
  const receiptButtonRef = useRef<HTMLAnchorElement | null>(null);
  const [countdown, setCountdown] = useState(() => buildCountdown(countdownEndsAt));
  const [holdCountdown, setHoldCountdown] = useState(() => buildRemainingHold(holdExpiresAt));
  const [showTransferInfo, setShowTransferInfo] = useState(false);
  const formattedTransferInstructions = useMemo(
    () => formatTransferInstructions(transferInstructions),
    [transferInstructions]
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
    if (!luckyNumber || typeof window === "undefined") {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    if (!isMobile) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      actionRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      const activeButton = showTransferInfo ? receiptButtonRef.current : transferButtonRef.current;
      window.setTimeout(() => {
        activeButton?.focus({ preventScroll: true });
      }, 420);
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [luckyNumber, showTransferInfo]);

  const formattedLuckyNumber = useMemo(() => {
    if (!luckyNumber) {
      return "----";
    }

    return luckyNumber.toString().padStart(4, "0");
  }, [luckyNumber]);

  return (
    <Box className={luckyNumber ? "raffle27-shell raffle27-shell--winner" : "raffle27-shell"}>
      <Box className="raffle27-sparks" aria-hidden="true" />
      <Box className="raffle27-poster-copy">
        <Typography className="raffle27-brand">Lodo Land GDL</Typography>
        <Box className="raffle27-warning-tapes" aria-hidden="true">
          <span className="raffle27-warning-tape raffle27-warning-tape--yellow">
            <b>Rifa entre</b>
            <b>Rifa entre</b>
            <b>Rifa entre</b>
          </span>
          <span className="raffle27-warning-tape raffle27-warning-tape--red">
            <b>Lodonautas</b>
            <b>Lodonautas</b>
            <b>Lodonautas</b>
          </span>
        </Box>
        <Typography className="raffle27-title" variant="h1">
          Gran Rifa
        </Typography>
        <Typography className="raffle27-red-slash">
          3 premios que te cambian el juego
        </Typography>
      </Box>

      <Box className="raffle27-date-badge">
        <strong>14</strong>
        <span>de junio<br />2026</span>
      </Box>

      <Box className="raffle27-machine" aria-label={`Numero asignado ${formattedLuckyNumber}`}>
        <Raffle27TombolaCanvas luckyNumber={luckyNumber} />
      </Box>

      <Typography className="raffle27-limited-copy">
        Rifa limitada a solo 1,500 numeros.
      </Typography>

      <Box className="raffle27-countdown">
        <Typography className="raffle27-countdown-label">{countdown.finished ? "Tombola cerrada" : "Termina en"}</Typography>
        <Box className="raffle27-countdown-grid">
          <CountdownCell label="Dias" value={padUnit(countdown.days)} />
          <CountdownCell label="Horas" value={padUnit(countdown.hours)} />
          <CountdownCell label="Min" value={padUnit(countdown.minutes)} />
          <CountdownCell label="Seg" value={padUnit(countdown.seconds)} />
        </Box>
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

      {luckyNumber ? (
        <Box
          className={showTransferInfo ? "raffle27-action-row raffle27-action-row--paid" : "raffle27-action-row"}
          ref={actionRowRef}
        >
          <span className="raffle27-action-guide">
            <span className="raffle27-focus-arrow" aria-hidden="true" />
          </span>
          {!showTransferInfo ? (
            <Button
              className="raffle27-primary-action raffle27-flow-action raffle27-action-focus"
              onClick={() => setShowTransferInfo(true)}
              ref={transferButtonRef}
              variant="contained"
            >
              Transferencia
            </Button>
          ) : null}
          {showTransferInfo && receiptHref ? (
            <Button
            className="raffle27-primary-action raffle27-paid-action raffle27-action-focus"
            component="a"
            href={receiptHref}
            ref={receiptButtonRef}
            rel="noreferrer"
            target="_blank"
              variant="contained"
            >
              Ya pague
            </Button>
          ) : null}
        </Box>
      ) : null}

      <Collapse className="raffle27-transfer-collapse" in={showTransferInfo}>
        <Box className="raffle27-transfer-box">
          <Typography variant="h3">Transferencia / deposito</Typography>
          <Typography className="raffle27-transfer-instructions" color="text.secondary" component="div" sx={{ whiteSpace: "pre-line" }}>
            {formattedTransferInstructions}
          </Typography>
          <Typography className="raffle27-transfer-note">
            En cuanto realices tu pago, usa el boton <strong>Ya pague</strong> y manda tu comprobante por WhatsApp. No habrá reembolsos por numeros no asignados y pagados.
          </Typography>
        </Box>
      </Collapse>

      <Box className="raffle27-contact-strip">
        <a href="https://www.lodoland.mx" rel="noreferrer" target="_blank">
          lodoland.mx
        </a>
        <span>Derechos reservados 2026</span>
        <a href="/legal/derechosreservados27mayo2026.pdf" rel="noreferrer" target="_blank">
          Derechos reservados
        </a>
        <a href="/legal/avisodeprivacidad.pdf" rel="noreferrer" target="_blank">
          Aviso de privacidad
        </a>
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
