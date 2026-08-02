import { getServerSession } from "next-auth/next";
import { buildAuthOptions } from "./auth";

/** Server-side session lookup for API routes and server components. */
export async function getSession() {
  const options = await buildAuthOptions();
  return getServerSession(options);
}
