'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminTopbarProps {
  session: {
    user: {
      name?: string | null
    }
  }
}

export function AdminTopbar({ session }: AdminTopbarProps) {
  const displayName = session.user.name ?? 'Administrador'

  return (
    <header className="bg-white border-b h-16 flex justify-between items-center px-6 shrink-0">
      <div />

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 font-medium">{displayName}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-gray-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Cerrar sesión</span>
        </Button>
      </div>
    </header>
  )
}
