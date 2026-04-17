import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AdminSectionCard } from "../../../components/admin-section-card";
import { DashboardShell } from "../../../components/dashboard-shell";
import { FlashAlert } from "../../../components/flash-alert";
import { requireAdmin } from "../../../lib/auth/session";
import { readFlashMessage } from "../../../lib/flash";
import { getCustomerAccountOptions } from "../../../lib/data/admin-sales";
import { getAvailableRaffles } from "../../../lib/data/customer";
import { formatEventDateTimeWallClock } from "../../../lib/date-format";
import { controlNavItems } from "../../../lib/navigation";
import { createRaffleAction, sellRaffleNumbersAsAdminAction } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

function formatNumberLabel(numberValue: number, digits: number) {
  return numberValue.toString().padStart(digits, "0");
}

export default async function AdminRafflesPage() {
  await requireAdmin();
  const flash = readFlashMessage("admin-raffles-flash");
  const [raffles, customers] = await Promise.all([getAvailableRaffles(24), getCustomerAccountOptions(120)]);

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Configuracion y operacion" title="Rifas">
      <FlashAlert cookieName="admin-raffles-flash" payload={flash} />

      <AdminSectionCard
        description="Define total de numeros, premios, forma de cobro y si el cliente podra escoger o solo recibir numero al azar."
        title="Nueva rifa"
      >
        <form action={createRaffleAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <TextField label="Titulo" name="title" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField helperText="Se genera si lo dejas vacio." label="Slug" name="slug" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField helperText="Precio por cada numero vendido." inputProps={{ min: 1, step: "0.01" }} label="Precio" name="entryPrice" required type="number" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField fullWidth label="Descripcion" multiline minRows={3} name="description" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                helperText="Un premio por linea. El sistema los guarda por separado."
                label="Premios"
                multiline
                minRows={4}
                name="prizeLines"
                placeholder={"1er lugar - Moto KTM\n2do lugar - Casco Fox\n3er lugar - Jersey oficial"}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField helperText="Cantidad total de numeros que existiran en la rifa." inputProps={{ min: 1, step: 1 }} label="Cantidad de numeros" name="totalNumbers" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Numero inicial del rango." inputProps={{ min: 0, step: 1 }} label="Desde" name="numbersStart" type="number" defaultValue="1" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Cantidad de digitos visuales." inputProps={{ min: 1, step: 1 }} label="Digitos" name="numberDigits" type="number" defaultValue="4" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField defaultValue="fixed_price" helperText="Si es aleatorio, el cliente no puede escoger numero." label="Modo de cobro" name="priceMode" select>
                <MenuItem value="fixed_price">Precio fijo por numero</MenuItem>
                <MenuItem value="random_number">Solo numero al azar</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField defaultValue="true" helperText="Solo aplica cuando no es modo aleatorio." label="Elegir numero" name="allowManualPick" select>
                <MenuItem value="true">Si</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Inicio" name="startsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Cierre" name="endsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Sorteo" name="drawAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField defaultValue="draft" label="Estado" name="status" select>
                <MenuItem value="draft">draft</MenuItem>
                <MenuItem value="published">published</MenuItem>
                <MenuItem value="archived">archived</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">Crear rifa</Button>
            </Box>
          </Box>
        </form>
      </AdminSectionCard>

      <AdminSectionCard
        description="Vende numeros desde control. Si la rifa esta en modo aleatorio, el sistema los asigna solo."
        title="Venta manual de numeros"
      >
        <form action={sellRaffleNumbersAsAdminAction} autoComplete="off" method="post">
          <input name="redirectTo" type="hidden" value="/admin/rifas" />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField label="Cliente" name="ownerUserId" required select>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.label} {customer.email ? `- ${customer.email}` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField label="Rifa" name="raffleId" required select>
                {raffles.map((raffle) => (
                  <MenuItem key={raffle.id} value={raffle.id}>
                    {raffle.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Cuantos numeros vender." inputProps={{ min: 1, step: 1 }} label="Cantidad" name="quantity" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField defaultValue="manual" helperText="Usa aleatorio cuando la rifa lo requiera." label="Asignacion" name="selectionMode" select>
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="random">Aleatoria</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" label="Nombre comprador" name="purchaserName" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" label="Correo comprador" name="purchaserEmail" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" label="Telefono comprador" name="purchaserPhone" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                helperText="Solo para seleccion manual. Separa por coma o espacio. Ejemplo: 12, 55, 103"
                label="Numeros manuales"
                name="manualNumbers"
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">Autorizar venta de numeros</Button>
            </Box>
          </Box>
        </form>
      </AdminSectionCard>

      <AdminSectionCard description="Consulta premios, configuracion y numeros ya vendidos." title="Rifas configuradas">
        {raffles.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {raffles.map((raffle) => (
              <Box key={raffle.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 2.5 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h3">{raffle.title}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${raffle.currency} ${raffle.entryPrice}`} size="small" />
                    <Chip label={raffle.status} size="small" />
                    {raffle.totalNumbers ? <Chip label={`${raffle.totalNumbers} numeros`} size="small" /> : null}
                    <Chip label={raffle.priceMode === "random_number" ? "Aleatoria" : "Manual o aleatoria"} size="small" />
                    <Chip label={`${raffle.availableCount} disponibles`} size="small" />
                    {raffle.reservedNumbers.length ? <Chip label={`${raffle.reservedNumbers.length} apartados`} size="small" /> : null}
                  </Stack>
                  {raffle.description ? <Typography color="text.secondary">{raffle.description}</Typography> : null}
                  <Typography color="text.secondary">Cierre: {formatDate(raffle.endsAt)}</Typography>
                  <Typography color="text.secondary">Sorteo: {formatDate(raffle.drawAt)}</Typography>
                  {raffle.prizes.length ? (
                    <Box sx={{ display: "grid", gap: 0.5 }}>
                      <Typography variant="body2">Premios</Typography>
                      {raffle.prizes.map((prize) => (
                        <Typography color="text.secondary" key={`${raffle.id}-${prize}`} variant="body2">
                          {prize}
                        </Typography>
                      ))}
                    </Box>
                  ) : null}
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography variant="body2">Numeros vendidos: {raffle.soldNumbers.length}</Typography>
                    {raffle.soldNumbers.length ? (
                      <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
                        {raffle.soldNumbers.map((numberValue) => (
                          <Box
                            key={`${raffle.id}-${numberValue}`}
                            sx={{
                              border: 1,
                              borderColor: "divider",
                              bgcolor: "background.paper",
                              py: 1,
                              px: 1.25,
                              textAlign: "center"
                            }}
                          >
                            <Typography variant="body2">
                              {formatNumberLabel(numberValue, raffle.numberDigits)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">Todavia no hay numeros vendidos.</Typography>
                    )}
                  </Box>
                  {raffle.reservedNumbers.length ? (
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <Typography variant="body2">Numeros apartados: {raffle.reservedNumbers.length}</Typography>
                      <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
                        {raffle.reservedNumbers.map((numberValue) => (
                          <Box
                            key={`${raffle.id}-reserved-${numberValue}`}
                            sx={{
                              border: 1,
                              borderColor: "divider",
                              bgcolor: "background.paper",
                              py: 1,
                              px: 1.25,
                              textAlign: "center"
                            }}
                          >
                            <Typography variant="body2">
                              {formatNumberLabel(numberValue, raffle.numberDigits)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : null}
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no hay rifas registradas.</Typography>
        )}
      </AdminSectionCard>
    </DashboardShell>
  );
}
