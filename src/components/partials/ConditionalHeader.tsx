// file to show which header should be shown according to the url
"use client";
import React from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./AdminHeader";
import Header from "./Header";

const ConditionalHeader = () => {
  const pathname = usePathname();

  // Check if the pathname starts with "/admin" exactly
  const isAdminPath = pathname.startsWith("/admin");

  return isAdminPath ? <AdminHeader /> : <Header />;
};

export default ConditionalHeader;
