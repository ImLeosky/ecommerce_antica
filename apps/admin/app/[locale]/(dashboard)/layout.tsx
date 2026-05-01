import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { LayoutProvider } from '@/components/LayoutContext'
import { createClient, getUserRole } from '@/utils/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const role = await getUserRole(supabase)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <LayoutProvider>
      <div className="h-screen overflow-hidden flex bg-(--background) text-(--foreground)">
        <Sidebar userRole={role || 'no-role-found'} userId={user?.id} />
        <div className="flex-1 flex flex-col min-w-0 md:pl-64">
          <Header userRole={role || 'no-role-found'} />
          <main className="flex-1 overflow-y-auto px-4 py-8 md:px-12 md:py-12 custom-scrollbar">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutProvider>
  )
}

