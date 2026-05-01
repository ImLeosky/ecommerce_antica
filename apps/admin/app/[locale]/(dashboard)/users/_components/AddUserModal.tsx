'use client'

import React, { useState, useTransition } from 'react'
import { addRoleByUserId } from '../actions'
import { UserPlus, X, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export function AddUserModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState<'admin' | 'operator'>('operator')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    startTransition(async () => {
      try {
        await addRoleByUserId(userId, role)
        setIsOpen(false)
        setUserId('')
      } catch (error) {
        alert('Error al agregar rol. Asegúrate de que el ID del usuario sea válido y no tenga un rol ya asignado.')
      }
    })
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <UserPlus size={18} />
        Agregar Operador
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="bg-(--card-bg) border border-(--card-border) rounded-3xl w-full max-w-md p-8 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-(--foreground) transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-serif text-(--foreground) mb-2">Agregar nuevo operador</h2>
              <p className="text-sm text-gray-500">
                Para agregar un operador, primero debes crearlo en el dashboard de Supabase Auth y luego ingresar su ID aquí.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-gray-500">User ID (UUID de Supabase)</Label>
                <Input 
                  id="userId"
                  placeholder="Ej: 550e8400-e29b-41d4-a716-446655440000"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-500">Rol</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      role === 'operator' 
                        ? 'bg-(--accent-gold)/10 border-(--accent-gold) text-(--accent-gold)' 
                        : 'bg-(--background) border-(--card-border) text-gray-500 hover:border-(--accent-gold)/50'
                    }`}
                  >
                    Operador
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      role === 'admin' 
                        ? 'bg-red-500/10 border-red-500 text-red-500' 
                        : 'bg-(--background) border-(--card-border) text-gray-500 hover:border-red-500/50'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
                <HelpCircle size={18} className="text-blue-400 shrink-0" />
                <p className="text-[10px] text-blue-400/80 leading-relaxed">
                  <strong>Nota:</strong> Próximamente habilitaremos la invitación por correo electrónico una vez configurada la API de Administración.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isPending || !userId}
                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs"
              >
                {isPending ? 'Agregando...' : 'Asignar Rol'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
