import crypto from "crypto";
import { prisma } from "./prisma";

/** How long a QR pairing stays valid if no one finishes scanning. */
export const SCAN_SESSION_EXPIRY_MINUTES = 15;

export async function createScanSession(): Promise<{ id: string; expiresAt: Date }> {
  // Opportunistic cleanup — no cron needed, this is the only place sessions
  // are created, so it's a natural point to sweep abandoned ones.
  await prisma.scanSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const id = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + SCAN_SESSION_EXPIRY_MINUTES * 60 * 1000);
  await prisma.scanSession.create({ data: { id, expiresAt } });
  return { id, expiresAt };
}

/** Returns null for a missing OR expired session — callers don't need to distinguish. */
export async function getActiveScanSession(id: string) {
  const session = await prisma.scanSession.findUnique({ where: { id } });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return session;
}
