"use client";

import Link from "next/link";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import GoogleIcon from "@mui/icons-material/Google";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import NightlightRoundOutlinedIcon from "@mui/icons-material/NightlightRoundOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Backdrop,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useMaterialMode } from "./material-theme-provider";

type AuthPortalProps = {
  errorMessage?: string | null;
  message?: string | null;
  mode: "customer" | "control";
};

export function AuthPortal({ errorMessage, message, mode }: AuthPortalProps) {
  const { mode: paletteMode, toggleMode } = useMaterialMode();
  const [expanded, setExpanded] = useState(mode === "customer" ? "signin" : "staff");
  const [blocking, setBlocking] = useState(false);
  const isCustomer = mode === "customer";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 4 },
        background:
          paletteMode === "dark"
            ? "linear-gradient(180deg, #09101c 0%, #0b111d 100%)"
            : "linear-gradient(180deg, #edf2f7 0%, #dbe4ef 100%)"
      }}
    >
      <Paper
        onSubmitCapture={() => setBlocking(true)}
        sx={{
          width: "100%",
          maxWidth: 560,
          border: "1px solid",
          borderColor: "divider",
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 3 },
          display: "grid",
          gap: 2.5
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" sx={{ letterSpacing: "0.12em", opacity: 0.72 }}>
              {isCustomer ? "Intranet" : "Control"}
            </Typography>
            <Typography variant="h1">
              {isCustomer ? "Acceso" : "Administración"}
            </Typography>
          </Stack>

          <Button
            color="inherit"
            onClick={toggleMode}
            startIcon={
              paletteMode === "dark" ? <NightlightRoundOutlinedIcon /> : <LightModeOutlinedIcon />
            }
            variant="outlined"
          >
            {paletteMode === "dark" ? "Oscuro" : "Claro"}
          </Button>
        </Stack>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {message ? <Alert severity="success">{message}</Alert> : null}

        <Stack spacing={1}>
          {isCustomer ? (
            <>
              <Accordion expanded={expanded === "signin"} onChange={() => setExpanded("signin")}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack spacing={0.25}>
                    <Typography variant="h2">Iniciar sesión</Typography>
                    <Typography variant="body2" color="text.secondary">
                      
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Stack spacing={1.25}>
                    <form action="/auth/login/google" autoComplete="off" method="post">
                          <Button
                            data-loading-label="Abriendo Google..."
                            fullWidth
                            startIcon={<GoogleIcon />}
                            sx={{
                              justifyContent: "flex-start",
                              bgcolor: "#ffffff",
                              color: "#111827",
                              border: "1px solid rgba(17,24,39,0.08)",
                              "&:hover": { bgcolor: "#f8fafc" }
                            }}
                            type="submit"
                            variant="contained"
                          >
                            Continuar con Google
                          </Button>
                      </form>

                      <form action="/auth/login/facebook" autoComplete="off" method="post">
                          <Button
                            data-loading-label="Abriendo Facebook..."
                            fullWidth
                            startIcon={<FacebookRoundedIcon />}
                            sx={{
                              justifyContent: "flex-start",
                              bgcolor: "#1877f2",
                              color: "#f8fbff",
                              "&:hover": { bgcolor: "#1464d2" }
                            }}
                            type="submit"
                            variant="contained"
                          >
                            Continuar con Facebook
                          </Button>
                      </form>
                    </Stack>

                    <Divider>o</Divider>

                    <form action="/auth/login/email" autoComplete="off" method="post">
                      <Stack spacing={2}>
                        <TextField label="Correo electrónico" name="email" required type="email" />
                        <TextField label="Contraseña" name="password" required type="password" />
                        <Button fullWidth type="submit" variant="contained">
                          Entrar a mi cuenta
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion expanded={expanded === "signup"} onChange={() => setExpanded("signup")}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack spacing={0.25}>
                    <Typography variant="h2">Crear cuenta</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Registrar con tu correo electrónico
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Typography color="text.secondary" variant="body2">
                      Verifica tu correo para poder hacer uso de nuestra plataforma.
                    </Typography>

                    <form action="/auth/signup/email" autoComplete="off" method="post">
                      <Stack spacing={2}>
                        <TextField label="Correo electrónico" name="email" required type="email" />
                        <TextField
                          inputProps={{ minLength: 8 }}
                          label="Contraseña"
                          name="password"
                          required
                          type="password"
                        />
                        <TextField
                          inputProps={{ minLength: 8 }}
                          label="Confirmar contraseña"
                          name="passwordConfirm"
                          required
                          type="password"
                        />
                        <Button fullWidth type="submit" variant="contained">
                          Crear cuenta
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </>
          ) : (
            <Accordion expanded={expanded === "staff"} onChange={() => setExpanded("staff")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack spacing={0.25}>
                  <Typography variant="h2">Iniciar sesión</Typography>
                  <Typography variant="body2" color="text.secondary">
                    
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography color="text.secondary" variant="body2">
                    Acceso no autorizado para clientes.
                  </Typography>

                  <form action="/auth/login/staff" autoComplete="off" method="post">
                    <Stack spacing={2}>
                      <TextField
                        label="Correo de la organización"
                        name="email"
                        placeholder="contacto@dominio.mx"
                        required
                        type="email"
                      />
                      <TextField label="Contraseña" name="password" required type="password" />
                      <Button fullWidth type="submit" variant="contained">
                        Entrar
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ pt: 0.5 }}
        >
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            {isCustomer ? <Link href="/admin/login">Admin</Link> : <Link href="/login">Soy cliente</Link>}
            <Link href="/">Ir a la web</Link>
          </Stack>
          <Typography color="text.secondary" variant="body2">
            Bienvenido
          </Typography>
        </Stack>
      </Paper>

      <Backdrop
        open={blocking}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 10,
          color: "#fff",
          backdropFilter: "blur(8px)",
          bgcolor: "rgba(3, 7, 18, 0.78)"
        }}
      >
        <Stack alignItems="center" spacing={1.25}>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Loading...</Typography>
          <Typography color="rgba(255,255,255,0.72)" variant="body2">
            Estamos procesando tu acceso.
          </Typography>
        </Stack>
      </Backdrop>
    </Box>
  );
}
