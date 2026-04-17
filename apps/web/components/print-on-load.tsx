"use client";

import { useEffect } from "react";

export function PrintOnLoad() {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.print();
    }, 240);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
