"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

type PaletteMode = "light" | "dark";

const storageKey = "lodoland-ui-mode";

const ColorModeContext = createContext<{
  mode: PaletteMode;
  toggleMode: () => void;
}>({
  mode: "dark",
  toggleMode: () => undefined
});

export function useMaterialMode() {
  return useContext(ColorModeContext);
}

export function MaterialThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>("dark");

  useEffect(() => {
    const storedMode = window.localStorage.getItem(storageKey);

    if (storedMode === "light" || storedMode === "dark") {
      setMode(storedMode);
    }
  }, []);

  const toggleMode = () => {
    setMode((currentMode) => {
      const nextMode = currentMode === "dark" ? "light" : "dark";
      window.localStorage.setItem(storageKey, nextMode);
      return nextMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        shape: {
          borderRadius: 0
        },
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#7dd3fc" : "#1d4ed8"
          },
          secondary: {
            main: mode === "dark" ? "#14b8a6" : "#0f766e"
          },
          background: {
            default: mode === "dark" ? "#0b111d" : "#eef2f7",
            paper: mode === "dark" ? "#121a27" : "#ffffff"
          },
          divider: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"
        },
        typography: {
          fontFamily: "var(--font-body), Roboto, sans-serif",
          h1: {
            fontSize: "1.625rem",
            fontWeight: 700,
            letterSpacing: "-0.02em"
          },
          h2: {
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "-0.02em"
          },
          h3: {
            fontSize: "1.05rem",
            fontWeight: 700
          },
          button: {
            textTransform: "none",
            fontWeight: 600
          }
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundImage: "none"
              }
            }
          },
          MuiPaper: {
            defaultProps: {
              square: true,
              elevation: 0
            },
            styleOverrides: {
              root: {
                backgroundImage: "none"
              }
            }
          },
          MuiCard: {
            defaultProps: {
              square: true,
              elevation: 0
            }
          },
          MuiButton: {
            defaultProps: {
              disableElevation: true
            },
            styleOverrides: {
              root: {
                minHeight: 46
              }
            }
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: 0
              }
            }
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 0
              }
            }
          },
          MuiTextField: {
            defaultProps: {
              variant: "outlined",
              fullWidth: true,
              autoComplete: "off"
            }
          },
          MuiAccordion: {
            defaultProps: {
              disableGutters: true,
              square: true,
              elevation: 0
            },
            styleOverrides: {
              root: {
                border: "1px solid",
                borderColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                "&::before": {
                  display: "none"
                }
              }
            }
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderRadius: 0
              }
            }
          },
          MuiAppBar: {
            defaultProps: {
              elevation: 0
            }
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 0
              }
            }
          }
        }
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
