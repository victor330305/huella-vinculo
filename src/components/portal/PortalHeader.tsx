'use client';
import { useRouter } from 'next/navigation';
import { PawPrint, LogOut } from 'lucide-react';

export function PortalHeader({ userName }: { userName: string }) {
  const router = useRouter();
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/portal/login');
    router.refresh();
  }
  return (
    <header className="bg-primary-500 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <PawPrint className="h-5 w-5" />
        <span className="font-semibold">Huella &amp; Vínculo</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">{userName}</span>
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:opacity-80">
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
