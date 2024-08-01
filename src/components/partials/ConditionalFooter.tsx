// footer for showing the current footer according to the url
"use client";
import React from "react";
import { usePathname } from "next/navigation";
import AdminFooter from "./AdminFooter";
import Footer from "./Footer";

const ConditionalFooter = () => {
  const pathname = usePathname();

  const isAdminPath = pathname.startsWith("/admin");

  return isAdminPath ? null : <Footer />;
};

export default ConditionalFooter;
