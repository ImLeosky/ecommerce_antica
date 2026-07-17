
"use client";

import { useState, useMemo } from 'react';
import { Calendar, List, Phone, Users, Clock, CalendarDays, X, MapPin, ClipboardList, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Timer, Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

type Reservation = {
  id: string;
  name: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  pre_order?: string;
  space_preference?: string;
  status: ReservationStatus;
  created_at: string;
};

export function ReservationManager({ initialReservations }: { initialReservations: Reservation[] }) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  const supabase = createClient();

  const normalize = (str: string) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredReservations = useMemo(() => {
    if (!searchTerm.trim()) return reservations;
    const normalizedSearch = normalize(searchTerm);
    return reservations.filter(res => 
      normalize(res.name).includes(normalizedSearch) ||
      normalize(res.phone || "").includes(normalizedSearch)
    );
  }, [reservations, searchTerm]);

  const updateStatus = async (id: string, newStatus: ReservationStatus) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      if (selectedRes?.id === id) {
        setSelectedRes({ ...selectedRes, status: newStatus });
      }
      toast.success(`Reserva ${newStatus === 'confirmed' ? 'confirmada' : newStatus === 'cancelled' ? 'cancelada' : 'puesta en espera'}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('No se pudo actualizar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getStatusConfig = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmada', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Cancelada', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle };
      default:
        return { label: 'En Espera', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Timer };
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border-r border-b border-(--card-border)/30 bg-accent-gold/[0.01]" />);
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayReservations = filteredReservations.filter(res => res.reservation_date === dateStr);
      
      days.push(
        <div 
          key={day} 
          className="h-24 border-r border-b border-(--card-border)/30 p-1.5 hover:bg-accent-gold/[0.03] transition-colors group relative cursor-pointer"
        >
          <span className="text-[10px] font-bold text-accent-gold/50 group-hover:text-accent-gold transition-colors">
            {day}
          </span>
          <div className="mt-1 space-y-0.5 overflow-y-auto max-h-[60px] custom-scrollbar">
            {dayReservations.map(res => {
              const statusConfig = getStatusConfig(res.status);
              return (
                <div 
                  key={res.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRes(res);
                  }}
                  className={`text-[8px] border rounded px-1 py-0.5 truncate transition-colors font-bold uppercase tracking-tighter ${statusConfig.color}`}
                >
                  {res.reservation_time.slice(0, 5)} {res.name}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-normal tracking-tight" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}>
            Reservas
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="h-0.5 w-4 bg-accent-gold/40 rounded-full" />
             <p className="text-[9px] font-bold text-accent-gold/60 uppercase tracking-[2px]">
               {view === 'list' ? 'Listado Detallado' : 'Calendario Mensual'}
             </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-accent-gold/40 group-focus-within:text-accent-gold transition-colors">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-2.5 w-full sm:w-[250px] rounded-2xl bg-accent-gold/[0.04] border border-accent-gold/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold/30 transition-all placeholder:text-accent-gold/30"
            />
          </div>

          <div className="flex items-center gap-1 bg-(--foreground)/5 p-1 rounded-xl border border-(--foreground)/10 shadow-inner">
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${view === 'list' ? 'bg-(--foreground) text-(--background) shadow-md' : 'text-(--foreground) opacity-60 hover:opacity-100 hover:bg-(--foreground)/5'}`}
          >
            <List size={12} />
            Lista
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-(--foreground) text-(--background) shadow-md' : 'text-(--foreground) opacity-60 hover:opacity-100 hover:bg-(--foreground)/5'}`}
          >
            <Calendar size={12} />
            Calendario
          </button>
        </div>
      </div>
    </div>

      {/* Main Content */}
      {view === 'list' ? (
        <div className="overflow-hidden rounded-2xl border border-(--card-border) bg-(--card-bg) shadow-[0_4px_20px_rgba(26,21,18,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-accent-gold/[0.03] text-[9px] font-bold uppercase tracking-widest text-accent-gold/60 border-b border-(--card-border)">
                <tr>
                  <th scope="col" className="px-6 py-4">Cliente</th>
                  <th scope="col" className="px-6 py-4">Estado</th>
                  <th scope="col" className="px-6 py-4">Fecha & Hora</th>
                  <th scope="col" className="px-6 py-4">Personas</th>
                  <th scope="col" className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--card-border)">
                {filteredReservations.map((res) => {
                  const statusConfig = getStatusConfig(res.status);
                  return (
                    <tr key={res.id} className="hover:bg-accent-gold/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-(--foreground)">{res.name}</div>
                        <div className="text-[10px] text-accent-gold/60 font-medium">{res.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider border ${statusConfig.color}`}>
                          <statusConfig.icon size={10} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-(--foreground) font-medium italic text-xs">
                        {res.reservation_date} <span className="text-accent-gold/40 font-normal not-italic ml-1">a las {res.reservation_time.slice(0, 5)}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className="inline-flex items-center rounded-lg bg-accent-gold/[0.05] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-accent-gold border border-accent-gold/10">
                            {res.number_of_guests} pax
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedRes(res)}
                          className="text-accent-gold/70 hover:text-accent-gold font-bold text-[9px] uppercase tracking-widest transition-all"
                        >
                          Detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredReservations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-accent-gold/40">
                        <Search size={48} strokeWidth={1} />
                        <p className="italic font-medium text-sm" style={{ fontFamily: "var(--font-serif)" }}>
                          No se encontraron reservas para "{searchTerm}"
                        </p>
                        <button 
                          onClick={() => setSearchTerm("")}
                          className="text-[10px] font-black uppercase tracking-widest text-accent-gold hover:underline"
                        >
                          Limpiar búsqueda
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-(--card-border) bg-(--card-bg) shadow-[0_4px_20px_rgba(26,21,18,0.02)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-(--card-border) bg-accent-gold/[0.02]">
            <h2 className="text-lg font-normal capitalize" style={{ fontFamily: 'var(--font-serif)' }}>
              {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-accent-gold/10 rounded-lg transition-colors text-accent-gold">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-accent-gold/10 rounded-lg transition-colors text-accent-gold">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-[9px] font-bold uppercase tracking-widest text-accent-gold/60 bg-accent-gold/[0.03]">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="py-3 text-center border-r border-b border-(--card-border)/30 last:border-r-0">{day}</div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      )}

      {/* Details Side Panel */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-[2px] transition-all duration-300">
          <div 
            className="h-full w-full max-w-md bg-(--background) shadow-2xl animate-slide-in p-0 flex flex-col border-l border-(--card-border)"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-(--card-border) bg-accent-gold/[0.02] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[9px] font-bold text-accent-gold uppercase tracking-[3px]">Reserva de Mesa</p>
                  <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter border ${getStatusConfig(selectedRes.status).color}`}>
                    {getStatusConfig(selectedRes.status).label}
                  </span>
                </div>
                <h2 className="text-2xl font-normal leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>{selectedRes.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedRes(null)}
                className="p-2 hover:bg-accent-gold/10 rounded-xl transition-all text-accent-gold"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-accent-gold/[0.04] border border-accent-gold/10">
                  <div className="flex items-center gap-2 text-accent-gold mb-1.5">
                    <CalendarDays size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Fecha</span>
                  </div>
                  <p className="text-lg font-bold italic text-(--foreground)">{selectedRes.reservation_date}</p>
                </div>
                <div className="p-4 rounded-2xl bg-accent-gold/[0.04] border border-accent-gold/10">
                  <div className="flex items-center gap-2 text-accent-gold mb-1.5">
                    <Clock size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Hora</span>
                  </div>
                  <p className="text-lg font-bold italic text-(--foreground)">{selectedRes.reservation_time.slice(0, 5)}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-accent-gold/[0.08] text-accent-gold">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-accent-gold/60 mb-0.5">Teléfono</p>
                    <p className="text-md font-bold text-(--foreground)">{selectedRes.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-accent-gold/[0.08] text-accent-gold">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-accent-gold/60 mb-0.5">Invitados</p>
                    <p className="text-md font-bold text-(--foreground)">{selectedRes.number_of_guests} pax</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-accent-gold/[0.08] text-accent-gold">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-accent-gold/60 mb-0.5">Ubicación</p>
                    <p className="text-md font-bold text-(--foreground) capitalize">{selectedRes.space_preference?.replace('_', ' ') || 'General'}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-accent-gold/60 mb-2">Pre-orden & Notas</p>
                  <div className="p-4 rounded-2xl bg-accent-gold/[0.03] border border-accent-gold/10 text-sm text-(--foreground)/80 leading-relaxed">
                    {selectedRes.pre_order ? (
                      <div>
                        {selectedRes.pre_order.includes(' | Notas: ') ? (
                          <>
                            <div className="font-medium mb-3 pb-3 border-b border-accent-gold/10">
                              <span className="text-[9px] uppercase font-bold text-accent-gold/60 block mb-1 tracking-wider">Productos solicitados:</span>
                              {selectedRes.pre_order.split(' | Notas: ')[0]}
                            </div>
                            <div className="italic">
                              <span className="text-[9px] uppercase font-bold text-accent-gold/60 block mb-1 not-italic tracking-wider">Notas adicionales:</span>
                              {selectedRes.pre_order.split(' | Notas: ')[1]}
                            </div>
                          </>
                        ) : (
                          <div className="italic">{selectedRes.pre_order}</div>
                        )}
                      </div>
                    ) : (
                      <span className="italic">No se incluyeron requerimientos especiales ni pre-órdenes.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-4 border-t border-(--card-border) space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-accent-gold mb-3">Acciones de Estado</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    disabled={selectedRes.status === 'confirmed' || isUpdating}
                    onClick={() => updateStatus(selectedRes.id, 'confirmed')}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-green-500/20 text-green-500 hover:bg-green-500/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <CheckCircle2 size={18} />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Confirmar</span>
                  </button>
                  <button 
                    disabled={selectedRes.status === 'pending' || isUpdating}
                    onClick={() => updateStatus(selectedRes.id, 'pending')}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-amber-500/20 text-amber-500 hover:bg-amber-500/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Timer size={18} />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Espera</span>
                  </button>
                  <button 
                    disabled={selectedRes.status === 'cancelled' || isUpdating}
                    onClick={() => updateStatus(selectedRes.id, 'cancelled')}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <XCircle size={18} />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Cancelar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-(--card-border)">
               <button 
                onClick={() => setSelectedRes(null)}
                className="w-full py-3.5 rounded-xl border border-(--card-border) text-(--foreground) text-[10px] font-bold uppercase tracking-widest hover:bg-accent-gold/5 transition-all"
               >
                 Cerrar
               </button>
            </div>
          </div>
          {/* Backdrop Closer */}
          <div className="absolute inset-0 -z-10" onClick={() => setSelectedRes(null)} />
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(203, 168, 124, 0.3);
        }
      `}</style>
    </div>
  );
}
