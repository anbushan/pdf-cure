import NextAuth from "next-auth";
import { buildAuthOptions } from "@/lib/auth";

async function handler(req: Request, ctx: { params: { nextauth: string[] } }) {
  const options = await buildAuthOptions();
  // NextAuth's default export returns a Route-Handler-compatible function
  // once invoked with options; options are built async here so Google
  // OAuth credentials can come from the DB (see lib/auth.ts).
  return (NextAuth(options) as any)(req, ctx);
}

export { handler as GET, handler as POST };
