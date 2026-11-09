import { getSession } from '@/lib/auth';
import { PortalHeader } from '@/components/portal/PortalHeader';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session && session.role === 'OWNER') {
    return (
      <div className="min-h-screen bg-cream">
        <PortalHeader userName={session.name} />
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </div>
    );
  }
  return <div className="min-h-screen bg-cream">{children}</div>;
}
