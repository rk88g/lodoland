"use client";

import { useMemo, useState } from "react";
import { Box, Button, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { upsertHomeEntityAction } from "../app/admin/diseno-web/actions";

type ManagedFieldSchema = {
  key: string;
  label: string;
  type: "text" | "textarea" | "link" | "image" | "color";
  helperText?: string;
  required?: boolean;
};

type ManagedGroupEditorItem = {
  id: string;
  label: string;
  assetId: string | null;
  primaryDetail: string | null;
  badges?: string[];
  values: Record<string, string>;
};

type ManagedGroupEditorProps = {
  formAnchor: string;
  entityKind: "sponsor" | "influencer";
  sectionKey: "patrocinadores" | "influencers";
  items: ManagedGroupEditorItem[];
  schema: readonly ManagedFieldSchema[];
  singularTitle: string;
  title: string;
};

function buildEmptyValues(schema: readonly ManagedFieldSchema[]) {
  return schema.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.key] = "";
    return accumulator;
  }, {});
}

export function ManagedGroupEditor({
  formAnchor,
  entityKind,
  sectionKey,
  items,
  schema,
  singularTitle,
  title
}: ManagedGroupEditorProps) {
  const emptyValues = useMemo(() => buildEmptyValues(schema), [schema]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, string>>(emptyValues);
  const isSponsor = entityKind === "sponsor";
  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  const handleSelect = (itemId: string) => {
    const item = items.find((entry) => entry.id === itemId) || null;

    if (!item) {
      setSelectedItemId("");
      setFormValues(emptyValues);
      return;
    }

    setSelectedItemId(item.id);
    setFormValues({
      ...emptyValues,
      ...item.values
    });
  };

  const clearSelection = () => {
    setSelectedItemId("");
    setFormValues(emptyValues);
  };

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          py: 1,
          borderTop: 1,
          borderBottom: 1,
          borderColor: "divider",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,193,7,0.08), rgba(0,188,212,0.08), rgba(255,255,255,0))"
        }}
      >
        <Box sx={{ width: 42, height: 4, bgcolor: "primary.main" }} />
        <Typography variant="h3">{title}</Typography>
      </Box>

      <Box sx={{ overflowX: "auto", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>{isSponsor ? "Link" : "Rol"}</TableCell>
              <TableCell>{isSponsor ? "Color / detalle" : "Redes"}</TableCell>
              <TableCell>Asset ID</TableCell>
              <TableCell align="right">Editar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length ? (
              items.map((item) => (
                <TableRow hover key={item.id} selected={item.id === selectedItemId}>
                  <TableCell>{item.values.name || item.label}</TableCell>
                  <TableCell>{item.primaryDetail || "Sin detalle"}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    {item.badges?.length ? (
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {item.badges.map((badge) => (
                          <Chip key={badge} label={badge} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    ) : (
                      item.values.background_color || item.values.accent_color || "Sin detalle"
                    )}
                  </TableCell>
                  <TableCell>{item.assetId || "-"}</TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => handleSelect(item.id)}
                      size="small"
                      type="button"
                      variant={item.id === selectedItemId ? "contained" : "outlined"}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">No hay registros todavia.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Box
        component="form"
        action={upsertHomeEntityAction}
        autoComplete="off"
        data-blocking-form="true"
        data-loading-label={selectedItem ? `Guardando ${singularTitle.toLowerCase()}...` : `Creando ${singularTitle.toLowerCase()}...`}
        id={formAnchor}
        sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5, display: "grid", gap: 2 }}
      >
        <input name="entityKind" type="hidden" value={entityKind} />
        <input name="sectionKey" type="hidden" value={sectionKey} />
        <input name="itemId" type="hidden" value={selectedItemId} />
        <input name="returnAnchor" type="hidden" value={formAnchor} />

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
          <Typography variant="h3">{selectedItem ? `Editar ${singularTitle}` : `Nuevo ${singularTitle}`}</Typography>
          {selectedItem ? (
            <Button onClick={clearSelection} size="small" type="button" variant="text">
              Limpiar formulario
            </Button>
          ) : null}
        </Stack>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          {schema.map((field) => {
            const isMultiline = field.type === "textarea";
            const isFullWidth = isMultiline;

            return (
              <Box key={field.key} sx={isFullWidth ? { gridColumn: "1 / -1" } : undefined}>
                <TextField
                  autoComplete="off"
                  fullWidth
                  helperText={field.helperText}
                  label={field.label}
                  minRows={isMultiline ? 3 : undefined}
                  multiline={isMultiline}
                  name={field.key}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      [field.key]: event.target.value
                    }))
                  }
                  required={field.required}
                  type={field.type === "link" ? "url" : field.type === "color" ? "color" : "text"}
                  value={formValues[field.key] || ""}
                />
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button data-loading-label={selectedItem ? `Guardando ${singularTitle.toLowerCase()}...` : `Creando ${singularTitle.toLowerCase()}...`} type="submit" variant="contained">
            {selectedItem ? `Guardar ${singularTitle}` : `Agregar ${singularTitle}`}
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
