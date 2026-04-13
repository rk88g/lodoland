"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import { useMaterialMode } from "./material-theme-provider";

type NavIcon =
  | "dashboard"
  | "design"
  | "events"
  | "catalog"
  | "promotions"
  | "tickets"
  | "finance"
  | "profile";

export type DashboardNavItem = {
  href: Route;
  icon: NavIcon;
  label: string;
};

type DashboardShellProps = {
  children: ReactNode;
  navItems: DashboardNavItem[];
  subtitle?: string;
  title: string;
};

const drawerWidth = 252;

function resolveIcon(icon: NavIcon) {
  switch (icon) {
    case "design":
      return <PaletteOutlinedIcon fontSize="small" />;
    case "events":
      return <CalendarMonthOutlinedIcon fontSize="small" />;
    case "catalog":
      return <CategoryOutlinedIcon fontSize="small" />;
    case "promotions":
      return <CampaignOutlinedIcon fontSize="small" />;
    case "tickets":
      return <ConfirmationNumberOutlinedIcon fontSize="small" />;
    case "finance":
      return <PaymentsOutlinedIcon fontSize="small" />;
    case "profile":
      return <PersonOutlineOutlinedIcon fontSize="small" />;
    default:
      return <DashboardOutlinedIcon fontSize="small" />;
  }
}

export function DashboardShell({
  children,
  navItems,
  subtitle,
  title
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { mode, toggleMode } = useMaterialMode();

  const drawerContent = useMemo(
    () => (
      <Box sx={{ height: "100%", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em" }}>
            LODO LAND
          </Typography>
        </Box>

        <List sx={{ px: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link href={item.href} key={item.href} style={{ color: "inherit", textDecoration: "none" }}>
                <ListItemButton
                  onClick={() => setMobileOpen(false)}
                  selected={active}
                  sx={{
                    mb: 0.5,
                    "&.Mui-selected": {
                      bgcolor: "action.selected"
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{resolveIcon(item.icon)}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Link>
            );
          })}
        </List>

        <Box sx={{ p: 2 }}>
          <form action="/auth/signout" method="post">
            <Button fullWidth startIcon={<LogoutOutlinedIcon />} type="submit" variant="outlined">
              Cerrar sesión
            </Button>
          </form>
        </Box>
      </Box>
    ),
    [navItems, pathname]
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        color="transparent"
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: 1,
          borderColor: "divider",
          backdropFilter: "blur(12px)",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(18, 26, 39, 0.72)" : "rgba(255, 255, 255, 0.82)"
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1.5, display: { md: "none" } }}
          >
            <MenuOutlinedIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h2">{title}</Typography>
            {subtitle ? (
              <Typography color="text.secondary" variant="body2">
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          <Button
            color="inherit"
            onClick={toggleMode}
            startIcon={mode === "dark" ? <DarkModeOutlinedIcon /> : <WbSunnyOutlinedIcon />}
            variant="outlined"
          >
            {mode === "dark" ? "Oscuro" : "Claro"}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex" }}>
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
          }}
          variant="temporary"
        >
          {drawerContent}
        </Drawer>

        <Drawer
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: 1,
              borderColor: "divider"
            }
          }}
          variant="permanent"
        >
          {drawerContent}
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Toolbar sx={{ minHeight: 64 }} />
          <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
            <Paper
              sx={{
                border: 1,
                borderColor: "divider",
                px: { xs: 2, md: 3 },
                py: { xs: 2, md: 2.5 }
              }}
            >
              <Stack divider={<Divider flexItem />} spacing={2}>
                {children}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
