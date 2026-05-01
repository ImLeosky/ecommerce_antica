'use client'
import { Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useLayout } from './LayoutContext'

export default function Header({ userRole = 'operator' }: { userRole?: string }) {
  const { toggleSidebar } = useLayout()

  const displayRole = userRole === 'admin' ? 'Administrador' : 'Operador'

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-6 md:px-8 backdrop-blur-md border-b border-(--card-border)" style={{ backgroundColor: 'var(--header-bg)' }}>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl bg-accent-gold/5 text-accent-gold border border-accent-gold/10"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-[10px] hidden sm:block font-bold uppercase tracking-[4px] text-gray-400">
          Sistema de Gestión
        </p>
      </div>

      
      <div className="flex items-center gap-6">
        <ThemeToggle />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-(--foreground)">{displayRole}</p>
            <p className="text-[10px] text-accent-gold font-bold uppercase tracking-wider">Online</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold text-(--avatar-text) font-black shadow-lg shadow-accent-gold/20 transition-colors">
            {displayRole.charAt(0)}
          </div>
        </div>
      </div>
    </header>


  )
}
