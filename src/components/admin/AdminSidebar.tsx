'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  Heart,
  X,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Clientes', href: '/admin/clientes', icon: Users, exact: false },
  { label: 'Perros', href: '/admin/perros', icon: PawPrint, exact: false },
  { label: 'Sesiones', href: '/admin/agenda', icon: CalendarDays, exact: false },
  {
    label: 'Ejercicios',
    href: '/admin/perros',
    icon: Heart,
    exact: false,
    note: 'Los ejercicios están en el perfil del perro',
  },
]

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-primary-700">
        <PawPrint className="h-6 w-6 text-primary-200" />
        <span className="text-lg font-bold text-white">Huella &amp; Vínculo</span>
      </div>

      {/* Nav links */}
      <ul className="flex-1 mt-4 space-y-1 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <li key={`${item.label}-${item.href}`}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={item.note}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-primary-700 text-white p-2 rounded-lg shadow"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 transform transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          className="absolute top-4 right-4 text-primary-200 hover:text-white"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-primary-800 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
