"use client";

import { useEffect } from "react";
import { Alert } from "@mui/material";
import type { FlashMessage } from "../lib/flash";

type FlashAlertProps = {
  cookieName: string;
  payload: FlashMessage | null;
};

export function FlashAlert({ cookieName, payload }: FlashAlertProps) {
  useEffect(() => {
    if (!payload) {
      return;
    }

    document.cookie = `${cookieName}=; Max-Age=0; path=/; SameSite=Lax`;
  }, [cookieName, payload]);

  if (!payload) {
    return null;
  }

  return <Alert severity={payload.type}>{payload.message}</Alert>;
}
