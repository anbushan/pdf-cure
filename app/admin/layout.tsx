import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin | PDFCure",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }

  return (
    <AdminShell userEmail={session.user.email ?? ""} userName={session.user.name ?? ""}>
      {children}
    </AdminShell>
  );
}
