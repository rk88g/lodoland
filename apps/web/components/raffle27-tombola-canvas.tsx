"use client";

import { useEffect, useRef } from "react";

type Raffle27TombolaCanvasProps = {
  luckyNumber: number | null;
};

const CANVAS_SIZE = 720;
const PREVIEW_NUMBERS = [47, 123, 188, 264, 319, 406, 521, 641, 887, 1022];

function numberLabel(value: number | null) {
  return value ? value.toString().padStart(4, "0") : "----";
}

function lowBiasedPreviewNumber() {
  return Math.min(1500, Math.floor(1 + Math.pow(Math.random(), 1.85) * 1500));
}

function ellipse(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  fill: string | CanvasGradient,
  stroke?: string,
  lineWidth = 1
) {
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();

  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
  }
}

function centeredText(context: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, fill: string) {
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = fill;
  context.fillText(text, x, y);
}

function drawBall(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  label: string,
  fill: string,
  textSize = 21
) {
  ellipse(context, x, y + radius * 0.86, radius * 0.82, radius * 0.18, "rgba(0,0,0,0.4)");
  ellipse(context, x, y, radius, radius, fill, "rgba(5,8,3,0.95)", Math.max(3, radius * 0.08));
  ellipse(context, x - radius * 0.32, y - radius * 0.42, radius * 0.22, radius * 0.14, "rgba(255,255,255,0.45)");

  if (label) {
    centeredText(context, label, x, y + 1, `900 ${textSize}px Arial, sans-serif`, "#050803");
  }
}

function drawTombolaFrame({
  context,
  frameProgress,
  luckyNumber,
  isMobile
}: {
  context: CanvasRenderingContext2D;
  frameProgress: number;
  luckyNumber: number | null;
  isMobile: boolean;
}) {
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const centerX = CANVAS_SIZE / 2;
  const centerY = 350;
  const glassGradient = context.createRadialGradient(centerX - 80, 210, 40, centerX, centerY, 285);
  glassGradient.addColorStop(0, "rgba(255,255,255,0.22)");
  glassGradient.addColorStop(0.42, "rgba(216,255,0,0.12)");
  glassGradient.addColorStop(1, "rgba(255,122,0,0.18)");

  ellipse(context, centerX, centerY, 276, 276, glassGradient, "rgba(255,255,255,0.48)", 4);
  ellipse(context, centerX, centerY, 224, 224, "rgba(4,8,4,0.2)", "rgba(255,255,255,0.2)", 3);

  context.save();
  context.globalAlpha = 0.55;
  context.lineWidth = 12;
  context.strokeStyle = "rgba(255,255,255,0.42)";
  context.beginPath();
  context.arc(centerX - 8, centerY, 246, Math.PI * 0.58, Math.PI * 1.18);
  context.stroke();
  context.restore();

  const ballCount = isMobile ? 6 : PREVIEW_NUMBERS.length;
  const shake = luckyNumber ? Math.max(0, 1 - frameProgress / 0.62) * 34 : 0;

  PREVIEW_NUMBERS.slice(0, ballCount).forEach((numberValue, index) => {
    const pileX = [-90, -50, -12, 28, 68, 108, -64, -24, 18, 58][index] || 0;
    const pileY = [150, 166, 150, 168, 152, 174, 102, 114, 102, 118][index] || 150;
    const phase = index * 0.83;
    const bounce = luckyNumber ? Math.abs(Math.sin(frameProgress * Math.PI * 5.2 + phase)) * (18 + (index % 3) * 5) : 0;
    const x = centerX + pileX + Math.sin(frameProgress * Math.PI * 7 + phase) * shake * 0.85;
    const y = centerY + pileY - bounce;
    const color = index % 3 === 0 ? "#dfff00" : index % 2 === 0 ? "#f0ecdc" : "#ff9200";
    drawBall(context, x, y, isMobile ? 35 : 42, numberValue.toString().padStart(4, "0"), color, isMobile ? 17 : 21);
  });

  context.save();
  context.globalAlpha = 0.18;
  ellipse(context, centerX, centerY, 276, 276, "rgba(245,255,225,0.18)", "rgba(255,255,255,0.24)", 3);
  context.restore();

  const winnerProgress = luckyNumber ? Math.min(1, Math.max(0, (frameProgress - 0.18) / 0.44)) : 0;
  const ease = 1 - Math.pow(1 - winnerProgress, 4);
  const winnerNumber = luckyNumber && frameProgress > 0.86 ? luckyNumber : luckyNumber ? lowBiasedPreviewNumber() : null;
  const winnerRadius = 74 + 48 * ease;
  const winnerY = 295 - 18 * ease;

  if (luckyNumber) {
    const glow = context.createRadialGradient(centerX, winnerY, 20, centerX, winnerY, winnerRadius * 2.2);
    glow.addColorStop(0, "rgba(216,255,0,0.52)");
    glow.addColorStop(1, "rgba(216,255,0,0)");
    ellipse(context, centerX, winnerY, winnerRadius * 2.2, winnerRadius * 2.2, glow);
  }

  drawBall(context, centerX, winnerY, luckyNumber ? winnerRadius : 82, "", "#dfff00", 25);
  centeredText(context, luckyNumber ? "TU BOLA" : "TOMBOLA", centerX, winnerY - 35, "900 22px Arial, sans-serif", "#050803");
  centeredText(context, luckyNumber ? "GANADORA" : "LISTA", centerX, winnerY - 6, "900 22px Arial, sans-serif", "#050803");
  centeredText(context, numberLabel(winnerNumber), centerX, winnerY + 50, "900 30px Arial, sans-serif", "#050803");

  context.save();
  context.fillStyle = "rgba(0,0,0,0.32)";
  context.beginPath();
  context.ellipse(centerX, 635, 180, 32, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#e8e5d1";
  context.fillRect(centerX - 80, 555, 160, 65);
  context.fillStyle = "#2f2f27";
  context.fillRect(centerX - 175, 650, 350, 55);
  context.beginPath();
  context.roundRect(centerX - 175, 610, 350, 80, 24);
  context.fillStyle = "#e8e5d1";
  context.fill();
  context.restore();
}

export function Raffle27TombolaCanvas({ luckyNumber }: Raffle27TombolaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.15 : 1.5);
    canvas.width = CANVAS_SIZE * pixelRatio;
    canvas.height = CANVAS_SIZE * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (!luckyNumber || prefersReducedMotion) {
      drawTombolaFrame({ context, frameProgress: luckyNumber ? 1 : 0, luckyNumber, isMobile });
      return;
    }

    const duration = isMobile ? 980 : 1700;
    const startedAt = performance.now();
    let frameId = 0;

    const render = (timestamp: number) => {
      const frameProgress = Math.min(1, (timestamp - startedAt) / duration);
      drawTombolaFrame({ context, frameProgress, luckyNumber, isMobile });

      if (frameProgress < 1) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, [luckyNumber]);

  return <canvas ref={canvasRef} className="raffle27-tombola-canvas" width={CANVAS_SIZE} height={CANVAS_SIZE} />;
}
