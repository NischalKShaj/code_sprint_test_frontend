// next-auth.d.ts
import NextAuth, { DefaultUser, DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

interface Users {
  id: string;
  email: string;
  role: string;
  username: string;
  profileImage: string;
  blocked: boolean;
  premium: boolean;
  isOnline: boolean;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    id?: string;
    users: Users;
  }

  interface User extends DefaultUser {
    accessToken?: string;
    id?: string;
    users: Users;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    users: Users;
  }
}
