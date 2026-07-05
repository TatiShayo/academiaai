"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function CheckoutHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      // Refresh usage data from server
      fetch("/api/usage").catch(() => {});
    }
  }, [searchParams]);

  return null;
}
