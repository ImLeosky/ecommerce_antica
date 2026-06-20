'use client'

import React, { useState } from 'react'
import { OrderStatusSelect } from './OrderStatusSelect'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  ShoppingBag,
  ExternalLink,
  X,
  Search
} from 'lucide-react'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_document_type: string
  customer_document_id: string
  total_amount: number
  status: string
  items: any[]
  created_at: string
  bold_status?: string
  bold_payment_link_id?: string
  bold_transaction_id?: string
  payment_method?: string
}

export function OrderList({ orders, locale }: { orders: Order[], locale: string }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const normalize = (text: any) => 
    String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const filteredOrders = orders.filter(order => {
    const q = normalize(searchQuery)
    return (
      normalize(order.customer_name).includes(q) ||
      normalize(order.customer_email || '').includes(q) ||
      normalize(order.id).includes(q)
    )
  })

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsSheetOpen(true)
  }

  return (
    <>
      {/* Search Bar */}
      <div className="relative max-w-md mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-accent-gold/40 group-focus-within:text-accent-gold transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, email o ID de pedido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-4 py-3.5 bg-(--card-bg) border border-(--card-border) rounded-2xl text-sm placeholder:text-accent-gold/30 focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold transition-all shadow-sm"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-(--card-border) bg-(--card-bg) shadow-[0_4px_20px_rgba(26,21,18,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent-gold/[0.03] text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 border-b border-(--card-border)">
              <tr>
                <th scope="col" className="px-8 py-6">Orden ID</th>
                <th scope="col" className="px-8 py-6">Cliente</th>
                <th scope="col" className="px-8 py-6 text-center">Productos</th>
                <th scope="col" className="px-8 py-6">Total</th>
                <th scope="col" className="px-8 py-6">Estado</th>
                <th scope="col" className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--card-border)">
              {filteredOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-accent-gold/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-mono text-[9px] px-2 py-1 rounded bg-accent-gold/10 text-accent-gold/70 font-bold border border-accent-gold/10">
                      #{String(order.id || '').slice(0, 8).toUpperCase()}
                    </span>
                    <div className="text-[10px] text-accent-gold/40 mt-1 font-bold">{new Date(order.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-(--foreground) text-sm">{order.customer_name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-accent-gold/50">{order.customer_email}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-2 py-1 rounded-full bg-accent-gold/5 text-accent-gold/60 text-[10px] font-bold border border-accent-gold/10">
                      {order.items?.length || 0} items
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-(--foreground) italic">
                    S/ {order.total_amount}
                  </td>
                  <td className="px-8 py-6">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleViewDetails(order)}
                      className="p-2 rounded-xl bg-accent-gold/10 text-accent-gold hover:bg-accent-gold hover:text-white transition-all duration-300"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-accent-gold/40 italic font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
                    No se encontraron pedidos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Slide-over Details Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedOrder(null)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-xl bg-(--card-bg) h-full shadow-2xl border-l border-(--card-border) flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            {/* Header */}
            <div className="p-8 border-b border-(--card-border) flex items-center justify-between bg-accent-gold/[0.03]">
              <div>
                <h2 className="text-3xl font-normal text-(--foreground)" style={{ fontFamily: 'var(--font-serif)' }}>
                  Detalles del Pedido
                </h2>
                <div className="text-[10px] font-bold text-accent-gold/60 uppercase tracking-widest flex items-center gap-2 mt-1">
                  <span className="bg-accent-gold/10 px-2 py-0.5 rounded border border-accent-gold/10">#{String(selectedOrder.id || '').slice(0,8).toUpperCase()}</span>
                  <span>•</span>
                  <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="h-10 w-10 rounded-xl bg-(--background) border border-(--card-border) flex items-center justify-center text-accent-gold hover:scale-110 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Seccion Cliente */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[3px] text-accent-gold/40 flex items-center gap-3">
                  <div className="h-px w-4 bg-accent-gold/20" />
                  Información del Cliente
                </h3>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-(--background) border border-(--card-border)">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-gold)' }}>
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-widest">Nombre Completo</p>
                      <p className="text-sm font-bold text-(--foreground)">{selectedOrder.customer_name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-(--background) border border-(--card-border)">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-gold)' }}>
                        <Mail size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-widest">Correo</p>
                        <p className="text-sm font-bold text-(--foreground) truncate">{selectedOrder.customer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-(--background) border border-(--card-border)">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-gold)' }}>
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-widest">{selectedOrder.customer_document_type || 'Documento'}</p>
                        <p className="text-sm font-bold text-(--foreground)">{selectedOrder.customer_document_id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-(--background) border border-(--card-border)">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-gold)' }}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-widest">Dirección de Entrega</p>
                      <p className="text-sm font-bold text-(--foreground)">{selectedOrder.customer_address || 'Sin dirección registrada'}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seccion Pago Bold */}
              {(selectedOrder.bold_status || selectedOrder.payment_method || selectedOrder.bold_payment_link_id) && (
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[3px] text-accent-gold/40 flex items-center gap-3">
                    <div className="h-px w-4 bg-accent-gold/20" />
                    Información del Pago (Bold)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedOrder.bold_status && (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-(--background) border border-(--card-border)">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: selectedOrder.bold_status === 'paid' ? '#16a34a' : selectedOrder.bold_status === 'rejected' ? '#ef4444' : 'var(--accent-gold)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-widest">Estado Bold</p>
                          <p className={`text-sm font-bold capitalize ${
                            selectedOrder.bold_status === 'paid' ? 'text-green-600' :
                            selectedOrder.bold_status === 'rejected' ? 'text-red-500' : ''
                          }`}>
                            {selectedOrder.bold_status === 'paid' ? 'Pagado' :
                             selectedOrder.bold_status === 'rejected' ? 'Rechazado' :
                             selectedOrder.bold_status === 'voided' ? 'Anulado' :
                             selectedOrder.bold_status === 'void_rejected' ? 'Anulación rechazada' :
                             selectedOrder.bold_status}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.payment_method && (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-(--background) border border-(--card-border)">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-gold)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-widest">Método de Pago</p>
                          <p className="text-sm font-bold text-(--foreground)">
                            {selectedOrder.payment_method === 'CARD' ? 'Tarjeta de crédito/débito' :
                             selectedOrder.payment_method === 'PSE' ? 'PSE' :
                             selectedOrder.payment_method === 'NEQUI' ? 'Nequi' :
                             selectedOrder.payment_method === 'BOTON_BANCOLOMBIA' ? 'Bancolombia' :
                             selectedOrder.payment_method === 'QR' ? 'QR' :
                             selectedOrder.payment_method || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.bold_payment_link_id && (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-(--background) border border-(--card-border) col-span-full">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-gold)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-widest">Link de Pago Bold</p>
                          <p className="text-sm font-mono text-(--foreground)">{selectedOrder.bold_payment_link_id}</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.bold_transaction_id && (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-(--background) border border-(--card-border) col-span-full">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-gold)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-widest">Transacción Bold</p>
                          <p className="text-sm font-mono text-(--foreground)">{selectedOrder.bold_transaction_id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Seccion Productos */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[3px] text-accent-gold/40 flex items-center gap-3">
                  <div className="h-px w-4 bg-accent-gold/20" />
                  Productos del Pedido
                </h3>
                <div className="rounded-3xl border border-(--card-border) overflow-hidden bg-(--background) shadow-sm">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="divide-y divide-(--card-border)">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-5 flex items-center gap-5 hover:bg-accent-gold/[0.02] transition-colors">
                          <div className="h-14 w-14 rounded-xl overflow-hidden border border-(--card-border) bg-(--card-bg)">
                            <img src={item.image_url || '/media/placeholder.png'} alt={item.name?.[locale] || 'Producto'} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-(--foreground)">{item.name?.[locale] || 'Producto'}</h4>
                            <p className="text-[10px] text-accent-gold/50 font-bold uppercase tracking-widest mt-0.5">
                              Cantidad: {item.quantity} • Unitario: S/ {item.price}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold italic" style={{ color: 'var(--accent-gold)' }}>S/ {item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      <div className="p-6 bg-accent-gold/[0.03] flex justify-between items-center border-t border-(--card-border)">
                        <span className="text-[10px] font-black uppercase tracking-[2px] text-accent-gold/60">Total de la Orden</span>
                        <span className="text-2xl font-normal" style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)' }}>S/ {selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 text-center italic text-accent-gold/40 text-sm">
                      No hay detalles de productos registrados para esta orden.
                    </div>
                  )}
                </div>
              </section>

              {/* Seccion Estado y Acciones */}
              <section 
                className="p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-all"
                style={{ backgroundColor: 'var(--accent-gold)', color: 'white' }}
              >
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <ShoppingBag size={24} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-[2px] text-white/70">Estado del Pedido</p>
                      <h4 className="text-xl font-bold capitalize">{selectedOrder.status}</h4>
                   </div>
                </div>
                <div className="w-full sm:w-auto">
                   <OrderStatusSelect orderId={selectedOrder.id} currentStatus={selectedOrder.status} />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 168, 124, 0.15);
          border-radius: 10px;
        }
      `}</style>
    </>
  )
}
