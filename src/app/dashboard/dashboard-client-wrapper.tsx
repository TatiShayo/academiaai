"use client";

import { DocumentsProvider } from "@/lib/documents-provider";
import type { ReactNode } from "react";

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
  return <DocumentsProvider>{children}</DocumentsProvider>;
}
