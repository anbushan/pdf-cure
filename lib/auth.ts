import { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { getSettings } from "./settings";

/**
 * Auth config is built per-request (not a static export) so that Google
 * OAuth credentials can come from the admin-editable Setting table and
 * take effect without a redeploy — see lib/settings.ts. They still need a
 * value in .env to bootstrap the very first sign-in, before any admin
 * exists to set them via the UI.
 */
export async function buildAuthOptions(): Promise<AuthOptions> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = await getSettings(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]);

  return {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "database" },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      GoogleProvider({
        clientId: GOOGLE_CLIENT_ID ?? "",
        clientSecret: GOOGLE_CLIENT_SECRET ?? "",
      }),
    ],
    pages: {
      signIn: "/",
    },
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          const u = user as { isAdmin?: boolean; plan?: string; planExpiresAt?: Date | null };
          session.user.id = user.id;
          session.user.isAdmin = u.isAdmin ?? false;
          const isPro = u.plan === "pro" && !!u.planExpiresAt && u.planExpiresAt.getTime() > Date.now();
          session.user.plan = isPro ? "pro" : "free";
          session.user.planExpiresAt = isPro ? u.planExpiresAt!.toISOString() : null;
        }
        return session;
      },
    },
    events: {
      /**
       * The first person to ever sign in becomes admin — no env var needed to
       * bootstrap the admin panel. If ADMIN_EMAIL is set, that address is
       * promoted to admin on every sign-in instead (or in addition), so admin
       * status doesn't depend on sign-in order — useful when testing with
       * one Google account as both a regular user and the admin.
       */
      async createUser({ user }) {
        const count = await prisma.user.count();
        if (count === 1 && user.id) {
          await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
        }
      },
      async signIn({ user }) {
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        if (adminEmail && user.email?.toLowerCase() === adminEmail && user.id) {
          await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
        }
      },
    },
  };
}
