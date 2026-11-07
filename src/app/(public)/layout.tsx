import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
