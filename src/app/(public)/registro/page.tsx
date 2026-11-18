import { RegistroClient } from "@/components/RegistroClient";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const initialTab =
    sp.tab === "empresa" ? "empresa" : sp.tab === "agencia" ? "agencia" : "personal";

  return <RegistroClient initialTab={initialTab} />;
}
