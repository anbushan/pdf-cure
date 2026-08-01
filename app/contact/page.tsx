import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/pageMetadata";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactHeading from "./ContactHeading";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: `Contact us | ${SITE_NAME}`,
  description: "Get in touch with the PDFCure team.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <div className="pb-24">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <div className="mx-auto max-w-xl px-6 pt-4">
        <ContactHeading />
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
