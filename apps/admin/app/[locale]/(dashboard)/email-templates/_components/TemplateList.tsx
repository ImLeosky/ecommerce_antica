'use client'

import React, { useState } from 'react'
import { Mail, Edit3, Eye, X, Save, Send } from 'lucide-react'
import { saveEmailTemplate, sendTestEmail } from '../actions'
import { toast } from "@repo/ui/toast"

interface Template {
  id: string
  key: string
  subject: string
  body_html: string
  updated_at: string
}

export function TemplateList({ templates }: { templates: Template[] }) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [subject, setSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [preview, setPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  const openEditor = (tpl: Template) => {
    setEditingTemplate(tpl)
    setSubject(tpl.subject)
    setBodyHtml(tpl.body_html)
    setPreview(false)
  }

  const handleSave = async () => {
    if (!editingTemplate) return
    setIsSaving(true)
    try {
      await saveEmailTemplate(editingTemplate.id, subject, bodyHtml)
      toast.success('Plantilla guardada correctamente')
      setEditingTemplate(null)
    } catch (e) {
      toast.error('Error al guardar: ' + String(e))
    } finally {
      setIsSaving(false)
    }
  }

  const templateLabels: Record<string, string> = {
    order_confirmation: 'Confirmación de Compra',
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-(--card-border) mb-12">
        <div>
          <h1 className="text-4xl font-normal tracking-tight" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}>
            Plantillas de Correo
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-0.5 w-6 bg-accent-gold/40 rounded-full" />
            <p className="text-[10px] font-bold text-accent-gold/60 uppercase tracking-[3px]">
              Personaliza los correos que reciben tus clientes
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-8 rounded-3xl border border-(--card-border) bg-(--card-bg) shadow-sm flex items-center justify-between group transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl bg-accent-gold/10 text-accent-gold">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-(--foreground) text-lg">
                  {templateLabels[tpl.key] || tpl.key}
                </h3>
                <p className="text-sm text-accent-gold/60 mt-1">
                  {tpl.subject}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Última actualización: {new Date(tpl.updated_at).toLocaleString('es-CO')}
                </p>
              </div>
            </div>
            <button
              onClick={() => openEditor(tpl)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#cba87c' }}
            >
              <Edit3 size={14} />
              Editar
            </button>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="text-center py-20 text-accent-gold/40">
            <Mail size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No hay plantillas disponibles</p>
            <p className="text-[10px] uppercase tracking-widest mt-2">Ejecuta la migración SQL para crear la plantilla inicial</p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--background)/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-(--card-border) bg-(--card-bg) shadow-2xl p-8">
            <button
              onClick={() => setEditingTemplate(null)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-accent-gold/10 text-accent-gold/60 hover:text-accent-gold transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-normal text-(--foreground) mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
              {templateLabels[editingTemplate.key] || editingTemplate.key}
            </h2>

            {!preview ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-accent-gold/60 uppercase tracking-widest mb-2">
                    Asunto del correo
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-(--card-border) bg-(--background)/50 px-4 py-3 text-(--foreground) focus:outline-none focus:border-accent-gold/30 transition-colors"
                    placeholder="Ej: ¡Gracias por tu compra, {{customer_name}}!"
                  />
                  <p className="text-[10px] text-accent-gold/40 mt-1.5 px-1">
                    Puedes usar variables como {'{{customer_name}}'}, {'{{order_id}}'}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-accent-gold/60 uppercase tracking-widest mb-2">
                    Cuerpo del correo (HTML)
                  </label>
                  <textarea
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    rows={24}
                    className="w-full rounded-xl border border-(--card-border) bg-(--background)/50 px-4 py-3 text-(--foreground) focus:outline-none focus:border-accent-gold/30 transition-colors font-mono text-sm leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-2 mt-3 px-1">
                    <span className="text-[9px] font-bold text-accent-gold/50 uppercase tracking-wider bg-accent-gold/5 px-2 py-1 rounded-lg">{'{{customer_name}}'}</span>
                    <span className="text-[9px] font-bold text-accent-gold/50 uppercase tracking-wider bg-accent-gold/5 px-2 py-1 rounded-lg">{'{{order_id}}'}</span>
                    <span className="text-[9px] font-bold text-accent-gold/50 uppercase tracking-wider bg-accent-gold/5 px-2 py-1 rounded-lg">{'{{total_amount}}'}</span>
                    <span className="text-[9px] font-bold text-accent-gold/50 uppercase tracking-wider bg-accent-gold/5 px-2 py-1 rounded-lg">{'{{currency}}'}</span>
                    <span className="text-[9px] font-bold text-accent-gold/50 uppercase tracking-wider bg-accent-gold/5 px-2 py-1 rounded-lg">{'{{payment_method}}'}</span>
                    <span className="text-[9px] font-bold text-accent-gold/50 uppercase tracking-wider bg-accent-gold/5 px-2 py-1 rounded-lg">{'{{customer_address}}'}</span>
                    <span className="text-[9px] font-bold text-accent-gold/50 uppercase tracking-wider bg-accent-gold/5 px-2 py-1 rounded-lg">{'{{items_rows}}'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-(--card-border) overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 text-xs text-gray-500 font-mono border-b">
                  {subject}
                </div>
                <iframe
                  srcDoc={bodyHtml}
                  className="w-full h-[600px] bg-white"
                  title="Email preview"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-(--card-border)">
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-64 rounded-xl border border-(--card-border) bg-(--background)/50 px-4 py-2.5 text-xs text-(--foreground) focus:outline-none focus:border-accent-gold/30 transition-colors"
                />
                <button
                  onClick={async () => {
                    if (!testEmail) { toast.error('Ingresa un correo de prueba'); return }
                    if (!editingTemplate) return
                    setSendingTest(true)
                    try {
                      const result = await sendTestEmail(editingTemplate.id, testEmail)
                      toast.success(`Correo de prueba enviado a ${testEmail}`)
                    } catch (e) {
                      toast.error('Error: ' + String(e))
                    } finally {
                      setSendingTest(false)
                    }
                  }}
                  disabled={sendingTest || !testEmail}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-accent-gold border border-accent-gold/20 hover:bg-accent-gold/5 transition-all duration-300 disabled:opacity-50"
                >
                  <Send size={14} />
                  {sendingTest ? 'Enviando...' : 'Enviar Prueba'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreview(!preview)}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-accent-gold border border-accent-gold/20 hover:bg-accent-gold/5 transition-all duration-300"
                >
                  <Eye size={14} />
                  {preview ? 'Editar' : 'Vista Previa'}
                </button>
                {!preview && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: '#cba87c' }}
                  >
                    <Save size={14} />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
