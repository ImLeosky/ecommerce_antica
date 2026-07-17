"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { supabase } from '@/lib/supabaseClient';
import styles from './ReservationForm.module.css';

type MenuItem = {
  id: number;
  name: Record<string, string>;
  price: number;
};

type MenuCategory = {
  id: number;
  name: Record<string, string>;
  products: MenuItem[];
};

type FormState = {
    success: boolean;
    message: string;
};

type ComponentState = FormState | null;

const ReservationForm = ({ reservationBg }: { reservationBg?: string }) => {
    const t = useTranslations('ReservationForm');
    const ts = useTranslations('Spaces');
    
    const [step, setStep] = useState(0); // 0: Invitation, 1-5: Steps, 6: Success
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState<ComponentState>(null);
    
    const [formData, setFormData] = useState({
        guests: '2',
        date: '',
        time: '',
        preOrder: '',
        space: '',
        name: '',
        phone: '',
    });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const locale = useLocale();

    useEffect(() => {
        const fetchMenu = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select(`
                    id,
                    name,
                    products!inner (
                        id,
                        name,
                        price
                    )
                `)
                .eq('products.available', true)
                .eq('exclude_from_menu', false)
                .order('sort_order', { ascending: true })
                .order('id', { foreignTable: 'products', ascending: true });
                
            if (!error && data) {
                const excludedKeywords = ['artesania', 'artesanía', 'experiencia', 'cafe de origen', 'café de origen'];
                const filteredCategories = data.filter(cat => {
                    const nameEs = cat.name?.es?.toLowerCase() || '';
                    return !excludedKeywords.some(keyword => nameEs.includes(keyword));
                });
                setCategories(filteredCategories);
            }
        };
        fetchMenu();
    }, []);

    useEffect(() => {
        const scrollToReservation = () => {
            const el = document.getElementById('reservation');
            if (!el) return;
            
            const headerOffset = 110;

            // 1. Initial smooth scroll
            setTimeout(() => {
                const rect = el.getBoundingClientRect();
                window.scrollTo({
                        top: window.scrollY + rect.top - headerOffset,
                        behavior: "smooth"
                });
            }, 100);

            // 2. Use a ResizeObserver to instantly snap back if dynamic content (like CafeMenu) shifts the layout
            const resizeObserver = new ResizeObserver(() => {
                const rect = el.getBoundingClientRect();
                // Si el elemento se movió de su posición anclada, lo corregimos inmediatamente (sin animación)
                if (Math.abs(rect.top - headerOffset) > 5) {
                    window.scrollTo({
                            top: window.scrollY + rect.top - headerOffset,
                            behavior: "auto"
                    });
                }
            });

            resizeObserver.observe(document.body);

            // 3. Cleanup after 3 seconds (when all images and queries are completely loaded)
            setTimeout(() => {
                resizeObserver.disconnect();
            }, 3000);
        };

        const handleStartReservation = () => {
            setStep(1);
            scrollToReservation();
        };

        if (typeof window !== "undefined") {
            // Check initial hash or session storage on mount
            const shouldOpen = window.location.hash === '#reservation' || sessionStorage.getItem('openReservation') === 'true';
            if (shouldOpen) {
                sessionStorage.removeItem('openReservation');
                setStep(1);
                scrollToReservation();
            }

            window.addEventListener('start-reservation', handleStartReservation);
            
            const handleHashChange = () => {
                if (window.location.hash === '#reservation') {
                    setStep(1);
                    scrollToReservation();
                }
            };
            window.addEventListener('hashchange', handleHashChange);

            return () => {
                window.removeEventListener('start-reservation', handleStartReservation);
                window.removeEventListener('hashchange', handleHashChange);
            };
        }
    }, []);

    const roundTime = (timeString: string) => {
        if (!timeString) return '';
        const parts = timeString.split(':').map(Number);
        const hours = parts[0] ?? 0;
        const minutes = parts[1] ?? 0;
        const totalMinutes = hours * 60 + minutes;
        // Round to nearest 15 minutes: 0, 15, 30, 45
        const roundedMinutes = Math.round(totalMinutes / 15) * 15;
        const finalHours = Math.floor(roundedMinutes / 60) % 24;
        const finalMinutes = roundedMinutes % 60;
        return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
    };

    const validateDateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return true;

        // Check Monday
        const date = new Date(dateStr + 'T00:00:00');
        if (date.getDay() === 1) { // Monday
            setErrorMsg(t('closedMonday'));
            return false;
        }

        // Check Hours (9:30 AM to 9:00 PM)
        const parts = timeStr.split(':').map(Number);
        const hours = parts[0] ?? 0;
        const minutes = parts[1] ?? 0;
        const timeVal = hours + minutes / 60;
        if (timeVal < 9.5 || timeVal > 21) {
            setErrorMsg(t('outsideHours'));
            return false;
        }

        setErrorMsg(null);
        return true;
    };

    const updateFormData = (field: string, value: string) => {
        let newValue = value;
        if (field === 'time') {
            newValue = roundTime(value);
        }
        
        setFormData(prev => {
            const updated = { ...prev, [field]: newValue };
            if (field === 'date' || field === 'time') {
                validateDateTime(updated.date, updated.time);
            }
            return updated;
        });
    };

    const nextStep = () => {
        if (step === 2) {
            if (!validateDateTime(formData.date, formData.time)) return;
            if (!formData.date || !formData.time) return;
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setErrorMsg(null);
        setStep(prev => prev - 1);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateDateTime(formData.date, formData.time)) return;
        
        setIsSubmitting(true);

        const preOrderItems: string[] = [];
        categories.forEach(cat => {
            cat.products.forEach(prod => {
                if ((quantities[prod.id] || 0) > 0) {
                    preOrderItems.push(`${quantities[prod.id]}x ${prod.name[locale as 'es' | 'en'] || prod.name.es}`);
                }
            });
        });
        
        let finalPreOrder = preOrderItems.join(', ');
        if (hasSelectedItems && formData.preOrder) {
            finalPreOrder = finalPreOrder ? `${finalPreOrder} | Notas: ${formData.preOrder}` : formData.preOrder;
        }
        
        try {
            const { supabase } = await import('@/lib/supabaseClient');
            
            const { error } = await supabase.from('reservations').insert({
                name: formData.name,
                phone: formData.phone,
                reservation_date: formData.date,
                reservation_time: formData.time,
                number_of_guests: parseInt(formData.guests, 10),
                pre_order: finalPreOrder,
                space_preference: formData.space
            });

            if (error) throw error;

            setFormState({ success: true, message: t('successMessage') });
        } catch (error: any) {
            console.error('Error submitting reservation:', error);
            // Si el error tiene detalles de Supabase, los mostramos para debug
            if (error?.message) console.error('Supabase Error Message:', error.message);
            if (error?.details) console.error('Supabase Error Details:', error.details);
            if (error?.hint) console.error('Supabase Error Hint:', error.hint);
            
            setFormState({ success: false, message: t('errorMessage') });
        } finally {
            setIsSubmitting(false);
            setStep(6);
        }
    };

    // Calculate progress percentage
    const progress = ((step - 1) / 4) * 100;
    const hasSelectedItems = Object.values(quantities).reduce((acc, qty) => acc + qty, 0) > 0;

    if (step === 0) {
        return (
            <section 
                id="reservation" 
                className={styles.section}
                style={reservationBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${reservationBg}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                <div className={styles.container}>
                    <div className={styles.invitation}>
                        <h2 className={styles.invitationTitle}>{t('invitationTitle')}</h2>
                        <p className={styles.invitationSubtitle}>{t('invitationSubtitle')}</p>
                        <button 
                            onClick={nextStep} 
                            className={`${styles.reserveNowBtn} btn btn-primary`}
                        >
                            {t('reserveNow')}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section 
            id="reservation" 
            className={styles.section}
            style={reservationBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('${reservationBg}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
            <div className={styles.container}>
                <div className={styles.formCard}>
                    {step < 6 && (
                        <div className={styles.progressBar}>
                            <div className={styles.progress} style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit}>
                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <div className={styles.stepHeader}>
                                    <h3 className={styles.stepTitle}>{t('stepGuests')}</h3>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('guestsLabel')}</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={formData.guests}
                                        onChange={(e) => updateFormData('guests', e.target.value)}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.buttonGroup}>
                                    <button type="button" onClick={prevStep} className={styles.backBtn}>{t('back')}</button>
                                    <button type="button" onClick={nextStep} className={`${styles.nextBtn} btn btn-primary`}>{t('next')}</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className={styles.stepContent}>
                                <div className={styles.stepHeader}>
                                    <h3 className={styles.stepTitle}>{t('stepDateTime')}</h3>
                                </div>
                                <div className={styles.dateTimeContainer}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('dateLabel')}</label>
                                        <input 
                                            type="date" 
                                            value={formData.date}
                                            onChange={(e) => updateFormData('date', e.target.value)}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('timeLabel')}</label>
                                        <input 
                                            type="time" 
                                            value={formData.time}
                                            onChange={(e) => updateFormData('time', e.target.value)}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                </div>
                                {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
                                <div className={styles.buttonGroup}>
                                    <button type="button" onClick={prevStep} className={styles.backBtn}>{t('back')}</button>
                                    <button type="button" onClick={nextStep} className={`${styles.nextBtn} btn btn-primary`}>{t('next')}</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.stepHeader}>
                                    <h3 className={styles.stepTitle}>{t('stepPreOrder')}</h3>
                                </div>
                                <div className={styles.productsContainer}>
                                    {categories.map(cat => (
                                        <div key={cat.id} style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.2rem' }}>{cat.name[locale] || cat.name.es}</h4>
                                            {cat.products.map(prod => (
                                                <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <span style={{ fontSize: '0.95rem' }}>{prod.name[locale] || prod.name.es} <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>(${prod.price})</span></span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <button type="button" onClick={() => setQuantities(prev => ({ ...prev, [prod.id]: Math.max(0, (prev[prod.id] || 0) - 1) }))} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                                                        <span style={{ width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{quantities[prod.id] || 0}</span>
                                                        <button type="button" onClick={() => setQuantities(prev => ({ ...prev, [prod.id]: (prev[prod.id] || 0) + 1 }))} style={{ background: 'var(--primary)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {hasSelectedItems && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Notas del pedido (Opcional)</label>
                                        <textarea 
                                            value={formData.preOrder}
                                            onChange={(e) => updateFormData('preOrder', e.target.value)}
                                            className={styles.textarea}
                                            placeholder="Ingresa notas adicionales para tu pedido..."
                                            rows={2}
                                        />
                                    </div>
                                )}
                                <div className={styles.buttonGroup}>
                                    <button type="button" onClick={prevStep} className={styles.backBtn}>{t('back')}</button>
                                    <button type="button" onClick={nextStep} className={`${styles.nextBtn} btn btn-primary`}>{t('next')}</button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className={styles.stepContent}>
                                <div className={styles.stepHeader}>
                                    <h3 className={styles.stepTitle}>{t('stepSpace')}</h3>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('spaceLabel')}</label>
                                    <select 
                                        value={formData.space}
                                        onChange={(e) => updateFormData('space', e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="">{t('noPreference')}</option>
                                        <option value="main_hall">{ts('space1.title')}</option>
                                        <option value="terrace">{ts('space2.title')}</option>
                                        <option value="events">{ts('space3.title')}</option>
                                        <option value="beverage_atelier">{ts('space4.title')}</option>
                                        <option value="romantic">{ts('space5.title')}</option>
                                    </select>
                                </div>
                                <div className={styles.buttonGroup}>
                                    <button type="button" onClick={prevStep} className={styles.backBtn}>{t('back')}</button>
                                    <button type="button" onClick={nextStep} className={`${styles.nextBtn} btn btn-primary`}>{t('next')}</button>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className={styles.stepContent}>
                                <div className={styles.stepHeader}>
                                    <h3 className={styles.stepTitle}>{t('stepDetails')}</h3>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('nameLabel')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => updateFormData('name', e.target.value)}
                                        className={styles.input}
                                        placeholder={t('namePlaceholder')}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{t('phoneLabel')}</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone}
                                        onChange={(e) => updateFormData('phone', e.target.value)}
                                        className={styles.input}
                                        placeholder={t('phonePlaceholder')}
                                        required
                                    />
                                </div>
                                <div className={styles.buttonGroup}>
                                    <button type="button" onClick={prevStep} className={styles.backBtn}>{t('back')}</button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className={`${styles.nextBtn} btn btn-primary`}
                                    >
                                        {isSubmitting ? '...' : t('submitButton')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className={styles.stepContent}>
                                <div className={styles.successStep}>
                                    <div className={`${styles.successIcon} ${!formState?.success ? styles.errorIcon : ''}`}>
                                        {formState?.success ? '✓' : '✕'}
                                    </div>
                                    <h3 className={styles.stepTitle} style={{ color: formState?.success ? 'inherit' : '#ef4444' }}>
                                        {formState?.success ? t('successMessage') : t('errorMessage')}
                                    </h3>
                                    <button 
                                        type="button" 
                                        onClick={() => setStep(0)} 
                                        className={`${styles.reserveNowBtn} btn btn-primary`}
                                        style={{ marginTop: '2rem' }}
                                    >
                                        {t('back')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ReservationForm;