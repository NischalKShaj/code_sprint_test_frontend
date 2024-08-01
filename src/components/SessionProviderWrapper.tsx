// components/SessionProviderWrapper.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export const SessionProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <SessionProvider>{children}</SessionProvider>;
};
