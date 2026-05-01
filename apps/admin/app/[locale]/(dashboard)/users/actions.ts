'use server'

import { createClient, getUserRole } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: 'admin' | 'operator') {
  const supabase = await createClient()
  const role = await getUserRole(supabase)

  if (role !== 'admin') {
    throw new Error('Not authorized')
  }

  const { error } = await supabase
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', userId)

  if (error) throw error

  revalidatePath('/[locale]/users', 'page')
}

export async function deleteUserRole(userId: string) {
  const supabase = await createClient()
  const role = await getUserRole(supabase)

  if (role !== 'admin') {
    throw new Error('Not authorized')
  }

  // No podemos borrar el usuario de auth sin service role key, 
  // pero podemos quitarle el rol para que no entre al admin.
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)

  if (error) throw error

  revalidatePath('/[locale]/users', 'page')
}

export async function addRoleByUserId(userId: string, role: 'admin' | 'operator') {
  const supabase = await createClient()
  const userRole = await getUserRole(supabase)

  if (userRole !== 'admin') {
    throw new Error('Not authorized')
  }

  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role })

  if (error) throw error

  revalidatePath('/[locale]/users', 'page')
}
