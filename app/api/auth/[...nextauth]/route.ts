import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ✅ Gunakan destrukturisasi handlers (Resmi untuk NextAuth v5)
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        console.log("🔍 [AUTHORIZE] Starting authorization...");
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [AUTHORIZE] Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            console.log("❌ [AUTHORIZE] User not found or no password");
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
          console.log("🔐 [AUTHORIZE] Password valid?", isPasswordValid);

          if (!isPasswordValid) {
            console.log("❌ [AUTHORIZE] Password invalid");
            return null;
          }

          console.log("✅ [AUTHORIZE] Login successful for:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name || "User",
            role: user.role,
          };
        } catch (error) {
          console.error("💥 [AUTHORIZE] CRITICAL ERROR:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
});

// ✅ Ekspor GET dan POST secara eksplisit dari handlers
export const { GET, POST } = handlers;