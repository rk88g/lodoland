import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { DashboardShell } from "../../components/dashboard-shell";
import { FlashAlert } from "../../components/flash-alert";
import { isEmailConfirmed, requireUser } from "../../lib/auth/session";
import {
  getAvailableRaffles,
  getCustomerRaffleReservations,
  getCustomerRaffles
} from "../../lib/data/customer";
import { formatEventDateTimeWallClock } from "../../lib/date-format";
import { readFlashMessage } from "../../lib/flash";
import { customerNavItems } from "../../lib/navigation";
import { redirect } from "next/navigation";
import {
  confirmCustomerRaffleReservationAction,
  reserveCustomerRaffleNumbersAction
} from "./actions";

export const dynamic = "force-dynamic";
const FLASH_COOKIE = "customer-raffles-flash";

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

function formatNumberLabel(numberValue: number, digits: number) {
  return numberValue.toString().padStart(digits, "0");
}

export default async function RafflesPage() {
  const { user } = await requireUser();

  if (!isEmailConfirmed(user)) {
    redirect("/perfil?message=Confirma tu correo para usar el modulo de rifas.");
  }

  const flash = readFlashMessage(FLASH_COOKIE);
  const [myEntries, raffles, reservations] = await Promise.all([
    getCustomerRaffles(user.id),
    getAvailableRaffles(12),
    getCustomerRaffleReservations(user.id)
  ]);

  return (
    <DashboardShell navItems={customerNavItems} subtitle="Mis numeros y rifas activas" title="Rifas">
      <FlashAlert cookieName={FLASH_COOKIE} payload={flash} />

      <Stack spacing={1.5}>
        <Typography variant="h2">Apartados activos</Typography>
        {reservations.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {reservations.map((reservation) => (
              <Box key={reservation.quantityGroup} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h3">{reservation.raffleTitle}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={reservation.selectionMode === "random" ? "Suerte" : "Seleccion manual"} size="small" />
                    <Chip label={`Expira: ${formatDate(reservation.expiresAt)}`} size="small" />
                  </Stack>
                  <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
                    {reservation.numbers.map((numberValue) => (
                      <Box
                        key={`${reservation.quantityGroup}-${numberValue}`}
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          bgcolor: "background.default",
                          py: 1,
                          px: 1.25,
                          textAlign: "center"
                        }}
                      >
                        <Typography variant="body2">
                          {formatNumberLabel(numberValue, reservation.numberDigits)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <form action={confirmCustomerRaffleReservationAction} method="post">
                    <input name="raffleId" type="hidden" value={reservation.raffleId} />
                    <input name="quantityGroup" type="hidden" value={reservation.quantityGroup} />
                    <Button type="submit" variant="contained">
                      Confirmar compra
                    </Button>
                  </form>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no tienes numeros apartados.</Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Mis participaciones</Typography>
        {myEntries.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {myEntries.map((entry) => (
              <Box key={entry.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h3">{entry.title}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${entry.quantity} numeros`} size="small" />
                    <Chip label={`${entry.currency} ${entry.unitPrice}`} size="small" />
                    <Chip label={entry.status} size="small" />
                  </Stack>
                  <Typography color="text.secondary">Cierre: {formatDate(entry.endsAt)}</Typography>
                  <Typography color="text.secondary">Sorteo: {formatDate(entry.drawAt)}</Typography>
                  {entry.numbers.length ? (
                    <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
                      {entry.numbers.map((numberValue) => (
                        <Box
                          key={`${entry.id}-${numberValue}`}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            bgcolor: "background.default",
                            py: 1,
                            px: 1.25,
                            textAlign: "center"
                          }}
                        >
                          <Typography variant="body2">{numberValue.toString().padStart(4, "0")}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">Tus numeros apareceran aqui.</Typography>
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no tienes compras de rifas en tu cuenta.</Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Rifas disponibles</Typography>
        {raffles.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {raffles.map((raffle) => (
              <Box key={raffle.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h3">{raffle.title}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${raffle.currency} ${raffle.entryPrice}`} size="small" />
                    <Chip label={raffle.status} size="small" />
                    {raffle.totalNumbers ? <Chip label={`${raffle.totalNumbers} numeros`} size="small" /> : null}
                  </Stack>
                  {raffle.description ? <Typography color="text.secondary">{raffle.description}</Typography> : null}
                  <Typography color="text.secondary">Cierre: {formatDate(raffle.endsAt)}</Typography>
                  <Typography color="text.secondary">Sorteo: {formatDate(raffle.drawAt)}</Typography>
                  <Typography color="text.secondary">
                    {raffle.priceMode === "random_number"
                      ? "Suerte: el numero se asigna al azar y se aparta 5 minutos."
                      : raffle.allowManualPick
                        ? "Puedes elegir numero o pedir asignacion aleatoria."
                        : "Los numeros se asignan automaticamente."}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${raffle.availableCount} disponibles`} size="small" />
                    <Chip label={`${raffle.soldNumbers.length} vendidos`} size="small" />
                    {raffle.reservedNumbers.length ? <Chip label={`${raffle.reservedNumbers.length} apartados`} size="small" /> : null}
                  </Stack>
                  {raffle.prizes.length ? (
                    <Box sx={{ display: "grid", gap: 0.5 }}>
                      {raffle.prizes.map((prize) => (
                        <Typography color="text.secondary" key={`${raffle.id}-${prize}`} variant="body2">
                          {prize}
                        </Typography>
                      ))}
                    </Box>
                  ) : null}
                  <form action={reserveCustomerRaffleNumbersAction} autoComplete="off" method="post">
                    <input name="raffleId" type="hidden" value={raffle.id} />
                    <input
                      name="selectionMode"
                      type="hidden"
                      value={raffle.priceMode === "random_number" ? "random" : "manual"}
                    />
                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
                      <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
                        <TextField
                          defaultValue="1"
                          helperText="Cuantos numeros quieres apartar."
                          inputProps={{ min: 1, step: 1 }}
                          label="Cantidad"
                          name="quantity"
                          required
                          type="number"
                        />
                      </Box>
                      {raffle.priceMode !== "random_number" && raffle.allowManualPick ? (
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 7" } }}>
                          <TextField
                            fullWidth
                            helperText="Separa por coma o espacio. Solo se apartan los disponibles."
                            label="Numeros"
                            name="manualNumbers"
                            placeholder="12, 55, 103"
                          />
                        </Box>
                      ) : null}
                      <Box sx={{ gridColumn: { xs: "1 / -1", md: raffle.priceMode !== "random_number" && raffle.allowManualPick ? "span 3" : "span 4" }, display: "flex", alignItems: "flex-end" }}>
                        <Button fullWidth type="submit" variant="contained">
                          {raffle.priceMode === "random_number" ? "Suerte" : "Apartar numeros"}
                        </Button>
                      </Box>
                    </Box>
                  </form>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no hay rifas configuradas.</Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
