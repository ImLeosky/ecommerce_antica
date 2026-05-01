'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  CalendarDays,
  Settings,
  LogOut,
  Type,
  Image as ImageIcon,
  Users
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useLayout } from './LayoutContext'

const menuGroups = [
  {
    label: 'Negocio',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Products & Experiences', href: '/products', icon: Package },
      { label: 'Categories', href: '/categories', icon: Tags },
      { label: 'Orders', href: '/orders', icon: ShoppingCart },
      { label: 'Reservations', href: '/reservations', icon: CalendarDays },
    ]
  },
  {
    label: 'CMS',
    items: [
      { label: 'CMS Texts', href: '/cms/texts', icon: Type },
      { label: 'CMS Media', href: '/cms/media', icon: ImageIcon },
    ]
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Settings', href: '/settings', icon: Settings },
    ]
  }
]


interface SidebarProps {
  userRole?: string
  userId?: string
}

export default function Sidebar({ userRole = 'operator', userId }: SidebarProps) {

  const pathname = usePathname()
  const { locale } = useParams()
  const { sidebarOpen, setSidebarOpen } = useLayout()

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-(--background)/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out border-r border-white/5 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#12100e' }}
      >


      <div className="flex h-full flex-col">
        {/* Brand Header */}
        <div className="flex h-20 items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cba87c]/10 border border-[#cba87c]/20">
                <span className="text-xl font-bold text-[#cba87c]">A</span>
             </div>
             <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Antica <span className="text-[#cba87c]">Admin</span></h1>
                <p className="text-[8px] uppercase tracking-[2px] text-gray-500 font-bold">Coffe & Bakery</p>
             </div>
          </div>
        </div>


        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-thin scrollbar-thumb-white/5">
          {menuGroups.map((group) => {
            // Si es admin, mostrar todo. Si es operador, filtrar.
            const filteredItems = userRole === 'admin' 
              ? group.items 
              : group.items.filter(item => {
                  const restrictedPaths = ['/products', '/categories', '/cms', '/settings', '/users']
                  return !restrictedPaths.some(path => item.href === path || item.href.startsWith(path + '/'))
                })

            if (filteredItems.length === 0) return null

            return (
              <div key={group.label} className="space-y-3">
                <h2 className="px-2 text-[10px] font-bold uppercase tracking-[3px] text-gray-600">
                  {group.label}
                </h2>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const fullHref = `/${locale}${item.href === '/' ? '' : item.href}`
                    const isActive = pathname === fullHref || (item.href === '/' && (pathname === `/${locale}` || pathname === `/${locale}/`))
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={fullHref}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-[#cba87c] text-white shadow-lg shadow-[#cba87c]/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-[#cba87c]'
                        }`}
                      >
                        <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'group-hover:text-[#cba87c]'}`} />
                        <span className="tracking-wide">{item.label}</span>
                        {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/5">
          <form action="/auth/signout" method="post">
            <button
               type="submit"
               className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 uppercase tracking-widest"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
    </>
  )
}
