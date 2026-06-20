'use client'

import React, { useState, useEffect } from 'react'
import { saveAdminConfig } from '../actions'
import { Save, FlaskConical, Settings2, Globe } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SettingsForm({ configs }: { configs: any[] }) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (configs) {
      setFormData(configs.reduce((acc, curr) => ({ ...acc, [curr.id]: JSON.stringify(curr.value, null, 2) }), {}))
    }
  }, [configs])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const parsedConfigs = Object.entries(formData).map(([id, val]) => ({
        id,
        value: JSON.parse(val)
      }))
      await saveAdminConfig(parsedConfigs)
      alert("¡Ajustes guardados correctamente!")
    } catch (e) {
      alert("Error al procesar JSON o guardar: " + String(e))
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTestMode = (configId: string, currentVal: string) => {
    try {
      const parsed = JSON.parse(currentVal)
      const newVal = JSON.stringify({ ...parsed, enabled: !parsed.enabled }, null, 2)
      setFormData(prev => ({ ...prev, [configId]: newVal }))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-(--card-border) mb-12">
        <div>
          <h1 className="text-4xl font-normal tracking-tight" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}>
            Ajustes del Sistema
          </h1>
          <div className="flex items-center gap-3 mt-2">
             <div className="h-0.5 w-6 bg-accent-gold/40 rounded-full" />
             <p className="text-[10px] font-bold text-accent-gold/60 uppercase tracking-[3px]">
               Control total sobre el comportamiento de la plataforma.
             </p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-3 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-xl shadow-accent-gold/20 transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: '#cba87c' }}
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid gap-8">
        {/* Special Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          {configs?.filter(c => c.key === 'test_mode_enabled').map((config) => {
            let isEnabled = false
            try { isEnabled = JSON.parse(formData[config.id] || '{}').enabled } catch(e) {}
            
            return (
              <div key={config.id} className="p-8 rounded-3xl border border-(--card-border) bg-(--card-bg) shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
                <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-2xl transition-colors ${isEnabled ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-400'}`}>
                      <FlaskConical size={24} />
                   </div>
                   <div>
                       <h3 className="font-bold text-(--foreground) text-lg">Modo Test de Compras</h3>
                       <p className="text-[10px] text-accent-gold/40 font-bold uppercase tracking-widest mt-1">Usa claves de prueba de Bold en lugar de producción</p>
                   </div>
                </div>
                <button 
                  onClick={() => toggleTestMode(config.id, formData[config.id] || '')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            )
          })}
        </div>

        {/* JSON Editor Section */}
        <div className="rounded-3xl border border-(--card-border) bg-(--card-bg) shadow-[0_4px_20px_rgba(26,21,18,0.02)] overflow-hidden">
          <div className="border-b border-(--card-border) px-8 py-6 bg-accent-gold/[0.03] flex items-center gap-3">
            <Settings2 className="text-accent-gold h-5 w-5" />
            <div>
              <h2 className="text-xl font-normal text-(--foreground)" style={{ fontFamily: 'var(--font-serif)' }}>Configuración Técnica</h2>
              <p className="mt-1 text-[10px] font-bold text-accent-gold/40 uppercase tracking-widest">Edición avanzada de parámetros JSON</p>
            </div>
          </div>
          <div className="p-8 space-y-10">
            {configs?.map((config: any) => (
              <div key={config.id} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Globe size={12} className="text-accent-gold/40" />
                  <label className="block text-[10px] font-bold text-accent-gold/60 uppercase tracking-widest">
                    {config.key}
                  </label>
                </div>
                <div className="flex rounded-2xl shadow-[0_2px_10px_rgba(26,21,18,0.01)] overflow-hidden border border-(--card-border) group focus-within:border-accent-gold/30 transition-colors">
                  <span className="inline-flex items-center border-r border-(--card-border) bg-(--background) px-4 text-[9px] font-bold text-accent-gold/60 uppercase tracking-widest">
                    JSON
                  </span>
                  <textarea
                    value={formData[config.id]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [config.id]: e.target.value }))}
                    rows={4}
                    className="block w-full border-0 py-4 px-5 text-(--foreground) bg-(--background)/30 placeholder:text-accent-gold/20 focus:ring-0 sm:text-sm font-mono leading-relaxed"
                  />
                </div>
                {config.description && (
                  <p className="text-[10px] text-accent-gold/40 px-2 italic font-medium">{config.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
