import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import {
  verifyPassword,
  isAccountLocked,
  recordLoginAttempt,
} from "./auth-utils";

type UserRole = "ADMIN" | "EDITOR" | "AUTHOR";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    twoFactorEnabled: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      displayName: string;
      role: UserRole;
      twoFactorEnabled: boolean;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        totp: { label: "Código 2FA", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const totp = credentials.totp as string | undefined;

        // Get client IP from headers
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded
          ? forwarded.split(",")[0]
          : request.headers.get("x-real-ip") || "unknown";
        const userAgent = request.headers.get("user-agent") || undefined;

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          await recordLoginAttempt(
            email,
            false,
            ip,
            userAgent,
            "user_not_found",
          );
          throw new Error("Credenciais inválidas");
        }

        // Check if account is locked
        if (isAccountLocked(user.lockedUntil)) {
          await recordLoginAttempt(
            email,
            false,
            ip,
            userAgent,
            "account_locked",
            user.id,
          );
          throw new Error("Conta bloqueada. Tente novamente mais tarde.");
        }

        // Verify password
        console.log("[AUTH] Verificando senha para:", email);
        console.log(
          "[AUTH] Hash armazenado:",
          user.passwordHash?.substring(0, 20) + "...",
        );
        const isValid = await verifyPassword(password, user.passwordHash);
        console.log("[AUTH] Senha válida:", isValid);
        if (!isValid) {
          // Increment failed attempts
          const newFailedAttempts = user.failedAttempts + 1;
          const lockAccount = newFailedAttempts >= 10;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: newFailedAttempts,
              lockedUntil: lockAccount
                ? new Date(Date.now() + 30 * 60 * 1000)
                : null, // Lock for 30 min
            },
          });

          await recordLoginAttempt(
            email,
            false,
            ip,
            userAgent,
            "invalid_password",
            user.id,
          );
          throw new Error("Credenciais inválidas");
        }

        // Verify 2FA if enabled
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          if (!totp) {
            throw new Error("2FA_REQUIRED");
          }

          const OTPAuth = await import("otpauth");
          const totpInstance = new OTPAuth.TOTP({
            issuer: "Prof.AMR",
            label: user.email,
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
          });

          const isValidTotp =
            totpInstance.validate({ token: totp, window: 1 }) !== null;

          if (!isValidTotp) {
            await recordLoginAttempt(
              email,
              false,
              ip,
              userAgent,
              "2fa_failed",
              user.id,
            );
            throw new Error("Código 2FA inválido");
          }
        }

        // Successful login - reset failed attempts and update last login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: ip,
          },
        });

        await recordLoginAttempt(email, true, ip, userAgent, null, user.id);

        return {
          id: user.id.toString(),
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.displayName = user.displayName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
        session.user.displayName = token.displayName as string;
      }
      return session;
    },
  },
});
