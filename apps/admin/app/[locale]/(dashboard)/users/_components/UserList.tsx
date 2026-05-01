'use client'

import React, { useState, useTransition } from 'react'
import { updateUserRole, deleteUserRole } from '../actions'
import { 
  Shield, 
  User as UserIcon, 
  MoreVertical, 
  Trash2, 
  ShieldAlert,
  Mail,
  Fingerprint
} from 'lucide-react'

interface UserListProps {
  users: any[]
}

export function UserList({ users }: UserListProps) {
  const [isPending, startTransition] = useTransition()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleUpdateRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'operator' : 'admin'
    if (confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) {
      startTransition(async () => {
        try {
          await updateUserRole(userId, newRole as any)
          setActiveMenu(null)
        } catch (error) {
          alert('Error al actualizar rol')
        }
      })
    }
  }

  const handleDelete = (userId: string) => {
    if (confirm('¿Estás seguro de quitar el acceso a este usuario?')) {
      startTransition(async () => {
        try {
          await deleteUserRole(userId)
          setActiveMenu(null)
        } catch (error) {
          alert('Error al quitar acceso')
        }
      })
    }
  }

  return (
    <div className="bg-(--card-bg) border border-(--card-border) rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--card-border) bg-(--foreground)/[0.02]">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Usuario</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rol</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID / Email</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--card-border)">
            {users.map((user) => (
              <tr key={user.user_id} className="group hover:bg-(--foreground)/[0.01] transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                      user.role === 'admin' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                        : 'bg-(--accent-gold)/10 border-(--accent-gold)/20 text-(--accent-gold)'
                    }`}>
                      {user.role === 'admin' ? <Shield size={18} /> : <UserIcon size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--foreground)">
                        {user.profiles?.full_name || user.profiles?.email || 'Usuario sin datos'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role === 'admin' ? 'Administrador del sistema' : 'Operador de plataforma'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail size={12} className="text-gray-400" />
                      {user.profiles?.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400/60 font-mono">
                      <Fingerprint size={10} />
                      {user.user_id.substring(0, 18)}...
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === user.user_id ? null : user.user_id)}
                    className="p-2 hover:bg-(--foreground)/5 rounded-lg text-gray-400 hover:text-(--foreground) transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {activeMenu === user.user_id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setActiveMenu(null)}
                      />
                      <div className="absolute right-6 top-14 w-48 bg-(--card-bg) border border-(--card-border) rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={() => handleUpdateRole(user.user_id, user.role)}
                          disabled={isPending}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-gray-600 hover:bg-(--background) hover:text-(--foreground) transition-colors"
                        >
                          <ShieldAlert size={14} />
                          Cambiar a {user.role === 'admin' ? 'Operador' : 'Admin'}
                        </button>
                        <div className="h-px bg-(--card-border) my-1" />
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          disabled={isPending}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={14} />
                          Quitar acceso
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <p className="text-gray-500 text-sm">No hay usuarios registrados con roles.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
