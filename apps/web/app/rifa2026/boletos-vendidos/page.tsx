import { Box, Chip, Stack, Typography } from "@mui/material";
import { getRaffle27NumbersBoard, getRaffle27Settings } from "../../../lib/raffle27";

export const dynamic = "force-dynamic";

function formatNumberLabel(numberValue: number) {
  return numberValue.toString().padStart(4, "0");
}

export default async function BoletosVendidosRifa2026Page() {
  const [settings, numbers] = await Promise.all([getRaffle27Settings(), getRaffle27NumbersBoard()]);
  const soldNumbers = numbers.filter((row) => row.status === "sold");
  const heldNumbers = numbers.filter((row) => row.status === "held");
  const availableNumbers = numbers.filter((row) => row.status === "available");

  return (
    <main className="raffle27-page">
      <div className="page-noise" />
      <Box className="raffle27-page-inner">
        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <Typography className="raffle27-title" variant="h1">
              Boletos vendidos
            </Typography>
            <Typography color="text.secondary">
              Consulta el estado de los 1,500 numeros para la {settings.title}.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`${soldNumbers.length} vendidos`} size="small" />
            <Chip label={`${heldNumbers.length} apartados`} size="small" />
            <Chip label={`${availableNumbers.length} disponibles`} size="small" />
          </Stack>

          <SectionBoard
            className="raffle27-board-sold"
            emptyLabel="Todavia no hay numeros vendidos."
            title="Vendidos"
            values={soldNumbers.map((row) => row.number_value)}
          />

          <SectionBoard
            className="raffle27-board-held"
            emptyLabel="No hay apartados activos en este momento."
            title="Apartados"
            values={heldNumbers.map((row) => row.number_value)}
          />

          <SectionBoard
            className="raffle27-board-available"
            emptyLabel="Ya no hay numeros disponibles."
            title="Disponibles"
            values={availableNumbers.map((row) => row.number_value)}
          />
        </Stack>
      </Box>
    </main>
  );
}

function SectionBoard({
  title,
  values,
  emptyLabel,
  className
}: {
  title: string;
  values: number[];
  emptyLabel: string;
  className: string;
}) {
  return (
    <Stack spacing={1.25}>
      <Typography variant="h2">{title}</Typography>
      {values.length ? (
        <Box className={`raffle27-number-board ${className}`}>
          {values.map((numberValue) => (
            <Box className="raffle27-number-pill" key={`${title}-${numberValue}`}>
              <Typography variant="body2">{formatNumberLabel(numberValue)}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">{emptyLabel}</Typography>
      )}
    </Stack>
  );
}
