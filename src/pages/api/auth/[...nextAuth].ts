// file for the google github authentications

import NextAuth from "next-auth/next";

import { authOptions } from "@/lib/auth";

// setting the authentication
const handlers = NextAuth(authOptions);

export { handlers as GET, handlers as POST };
