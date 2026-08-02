import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import AccountShell from "@/components/account/AccountShell";

export const metadata = {
  title: "My Account | PDFCure",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <AccountShell userEmail={session.user.email ?? ""} userName={session.user.name ?? ""}>
      {children}
    </AccountShell>
  );
}
