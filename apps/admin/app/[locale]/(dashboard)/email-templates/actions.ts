'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

export async function getAllEmailTemplates() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('email_templates')
    .select('*')
    .order('key')
  return data || []
}

export async function getEmailTemplate(key: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('email_templates')
    .select('*')
    .eq('key', key)
    .single()
  return data
}

export async function saveEmailTemplate(
  id: string,
  subject: string,
  bodyHtml: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('email_templates')
    .update({
      subject,
      body_html: bodyHtml,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/email-templates')
}

export async function sendTestEmail(templateId: string, toEmail: string) {
  const supabase = await createClient()

  const { data: template, error: tplError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (tplError || !template) {
    throw new Error('Plantilla no encontrada')
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY no está configurada en el servidor')
  }

  const fromEmail = process.env.EMAIL_FROM || 'Antíca <noreply@anticamm.com>'
  const resend = new Resend(resendApiKey)

  const subject = template.subject
    .replace(/\{\{customer_name\}\}/g, 'Cliente de Prueba')
    .replace(/\{\{order_id\}\}/g, 'TEST-001')
    .replace(/\{\{total_amount\}\}/g, '150.000')
    .replace(/\{\{currency\}\}/g, 'COP')
    .replace(/\{\{payment_method\}\}/g, 'Tarjeta de crédito')
    .replace(/\{\{customer_address\}\}/g, 'Calle de prueba #123')
    .replace(/\{\{items_rows\}\}/g, '<tr><td style="padding:12px 0;border-bottom:1px solid #eee;">Producto de prueba x 1</td><td style="text-align:right;">$150.000</td></tr>')

  const html = template.body_html
    .replace(/\{\{customer_name\}\}/g, 'Cliente de Prueba')
    .replace(/\{\{order_id\}\}/g, 'TEST-001')
    .replace(/\{\{total_amount\}\}/g, '150.000')
    .replace(/\{\{currency\}\}/g, 'COP')
    .replace(/\{\{payment_method\}\}/g, 'Tarjeta de crédito')
    .replace(/\{\{customer_address\}\}/g, 'Calle de prueba #123')
    .replace(/\{\{items_rows\}\}/g, '<tr><td style="padding:12px 0;border-bottom:1px solid #eee;">Producto de prueba x 1</td><td style="text-align:right;">$150.000</td></tr>')

  const { error: sendError, data } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject,
    html,
  })

  if (sendError) {
    throw new Error(`Error al enviar: ${sendError.message}`)
  }

  return { success: true, id: data?.id }
}
