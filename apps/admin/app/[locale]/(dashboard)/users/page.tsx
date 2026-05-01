import { createClient, getUserRole } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { UserList } from './_components/UserList'
import { AddUserModal } from './_components/AddUserModal'
import { Users, ShieldCheck, UserPlus } from 'lucide-react'

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const supabase = await createClient()
  const { locale } = await params
  
  // Verificar que sea admin
  const role = await getUserRole(supabase)
  if (role !== 'admin') {
    redirect(`/${locale}`)
  }

  // Obtener roles y perfiles por separado para evitar problemas de relación
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name')

  const error = rolesError || profilesError
  const users = roles?.map(role => ({
    ...role,
    profiles: profiles?.find(p => p.id === role.user_id)
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-normal tracking-tight" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}>
            Usuarios y Roles
          </h1>
          <div className="flex items-center gap-3 mt-1">
             <div className="h-0.5 w-6 bg-[#cba87c]/40 rounded-full" />
             <p className="text-[10px] font-bold text-[#cba87c]/60 uppercase tracking-[2px]">
               Administración de accesos y operadores
             </p>
          </div>
        </div>
        <AddUserModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-(--card-bg) border border-(--card-border) rounded-3xl p-6 relative overflow-hidden group shadow-sm">
           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity text-(--foreground)">
              <Users size={80} />
           </div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Usuarios</p>
           <p className="text-3xl font-serif text-(--foreground)">{users?.length || 0}</p>
        </div>
        <div className="bg-(--card-bg) border border-(--card-border) rounded-3xl p-6 relative overflow-hidden group shadow-sm">
           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity text-(--foreground)">
              <ShieldCheck size={80} />
           </div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Administradores</p>
           <p className="text-3xl font-serif text-(--foreground)">{users?.filter((u: any) => u.role === 'admin').length || 0}</p>
        </div>
        <div className="bg-(--card-bg) border border-(--card-border) rounded-3xl p-6 relative overflow-hidden group shadow-sm">
           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity text-(--foreground)">
              <UserPlus size={80} />
           </div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Operadores</p>
           <p className="text-3xl font-serif text-(--foreground)">{users?.filter((u: any) => u.role === 'operator').length || 0}</p>
        </div>
      </div>

      <UserList users={(users as any) || []} />
    </div>
  )
}
