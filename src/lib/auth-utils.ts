import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { prisma } from "./prisma";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Senha deve ter no mínimo 8 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra maiúscula");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra minúscula");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Senha deve conter pelo menos um número");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if account is locked
 */
export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return new Date() < lockedUntil;
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ipAddress: string,
  userAgent?: string,
  reason?: string | null,
  userId?: number,
): Promise<void> {
  await prisma.loginLog.create({
    data: {
      email,
      success,
      ipAddress,
      userAgent,
      reason,
      userId,
    },
  });
}

/**
 * Check rate limit for login attempts
 * Returns true if too many attempts in the last 15 minutes
 */
export async function isRateLimited(
  email: string,
  ipAddress: string,
): Promise<boolean> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const recentAttempts = await prisma.loginLog.count({
    where: {
      OR: [{ email }, { ipAddress }],
      success: false,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  return recentAttempts >= 5;
}

/**
 * Generate 2FA secret and QR code
 */
export async function generate2FASecret(email: string): Promise<{
  secret: string;
  qrCodeUrl: string;
}> {
  // Generate a random secret
  const secret = new OTPAuth.Secret({ size: 20 });

  // Create TOTP instance
  const totp = new OTPAuth.TOTP({
    issuer: "Prof.AMR",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  });

  const qrCodeUrl = await QRCode.toDataURL(totp.toString());

  return {
    secret: secret.base32,
    qrCodeUrl,
  };
}

/**
 * Verify 2FA token
 */
export function verify2FAToken(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: "Prof.AMR",
    label: "user",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // Validate with window of 1 (allows 1 step before/after)
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

/**
 * Enable 2FA for a user
 */
export async function enable2FA(
  userId: number,
  secret: string,
  token: string,
): Promise<boolean> {
  // Verify token first
  if (!verify2FAToken(secret, token)) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    },
  });

  return true;
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      twoFactorEnabled: false,
    },
  });
}

/**
 * Create initial admin user if none exists
 */
export async function ensureAdminUser(): Promise<void> {
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminExists) {
    const defaultPassword = "Admin@123"; // Should be changed immediately
    const hash = await hashPassword(defaultPassword);

    await prisma.user.create({
      data: {
        email: "admin@profamr.com",
        displayName: "Administrador",
        passwordHash: hash,
        role: "ADMIN",
      },
    });

    console.log("Admin user created with default credentials.");
    console.log("Email: admin@profamr.com");
    console.log("Password: Admin@123");
    console.log("IMPORTANT: Change this password immediately!");
  }
}
