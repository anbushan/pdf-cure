import Client from "./Client";

export const metadata = {
  title: "Scan documents — PDFCure",
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: { id: string } }) {
  return <Client sessionId={params.id} />;
}
