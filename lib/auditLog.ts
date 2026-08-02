import { prisma } from "./prisma";

interface AuditLogEntry {
  actorEmail: string;
  actorName?: string | null;
  action: string;
  target?: string;
  detail?: string;
}

/**
 * Best-effort — a failed audit write should never break the action it's
 * describing, so errors are swallowed (and logged to the server console
 * for visibility) rather than thrown.
 */
export async function logAudit(entry: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        actorEmail: entry.actorEmail,
        actorName: entry.actorName ?? null,
        action: entry.action,
        target: entry.target ?? null,
        detail: entry.detail ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
