"use client";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useTranslations, useLocale } from "next-intl";
import { getSettings } from "@/lib/cms";
import styles from "../Checkout.module.css";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface CheckoutUIProps {
  heroImage: string;
}

export default function CheckoutUI({ heroImage }: CheckoutUIProps) {
  const [currency, setCurrency] = useState("COP");
  const { items, getTotalPrice } = useCartStore();
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [boldConfig, setBoldConfig] = useState<any>(null);
  const boldCheckoutRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [boldLibReady, setBoldLibReady] = useState(false);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const curr = await getSettings("currency", "COP");
        setCurrency(curr);
        const testConfig = await getSettings("test_mode_enabled", { enabled: false });
        setTestMode(!!testConfig.enabled);
      } catch (e) {
        console.error("Error loading configs:", e);
      }
    };
    fetchConfigs();

    const initBoldCheckout = () => {
      if (document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]')) {
        setBoldLibReady(true);
        return;
      }
      const js = document.createElement("script");
      js.onload = () => setBoldLibReady(true);
      js.onerror = () => console.error("Bold checkout library failed to load");
      js.src = "https://checkout.bold.co/library/boldPaymentButton.js";
      document.head.appendChild(js);
    };

    initBoldCheckout();
  }, []);

  const [submitted, setSubmitted] = useState(false);

  const handlePay = async () => {
    if (submitted) return;
    const form = formRef.current;
    if (!form) return;

    setSubmitted(true);
    setLoading(true);
    setIsRedirecting(true);

    const formData = new FormData(form);
    const email = formData.get("email") as string;

    const billingData = {
      name: formData.get("name") as string,
      email: email,
      phone: formData.get("phone") as string || "",
      docType: formData.get("docType") as string,
      docId: formData.get("docId") as string,
      address: formData.get("address") as string,
    };

    try {
      const cartItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url
      }));

      const { data: order, error: insertError } = await supabase
        .from('orders')
        .insert({
          customer_name: billingData.name,
          customer_email: billingData.email,
          customer_phone: billingData.phone || null,
          customer_address: billingData.address,
          customer_document_type: billingData.docType,
          customer_document_id: billingData.docId,
          total_amount: getTotalPrice(),
          items: cartItems,
          status: 'pending'
        })
        .select('id')
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(insertError.message);
      }
      if (!order?.id) {
        console.error("No order id returned:", order);
        throw new Error("No se pudo crear la orden");
      }

      const res = await fetch("/api/bold/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          orderId: String(order.id),
          totalAmount: getTotalPrice(),
          email: billingData.email,
          name: billingData.name,
          phone: billingData.phone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al obtener config de pago");
      }

      const { config } = await res.json();
      setBoldConfig(config);
    } catch (error: any) {
      console.error("Error processing checkout:", error);
      toast.error("Error: " + (error.message || "Error desconocido"));
      setIsRedirecting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!boldConfig || !boldLibReady || typeof window === "undefined") return;

    const BoldCheckout = (window as any).BoldCheckout;
    if (typeof BoldCheckout !== "function") {
      console.error("BoldCheckout constructor not found on window");
      toast.error("Error al cargar la pasarela de pago");
      setIsRedirecting(false);
      setLoading(false);
      return;
    }

    try {
      boldCheckoutRef.current = new BoldCheckout({
        ...boldConfig,
        originUrl: window.location.href,
      });
    } catch (error: any) {
      console.error("Bold checkout error:", error);
      toast.error("Error al iniciar el pago");
      setIsRedirecting(false);
      setLoading(false);
    }
  }, [boldConfig, boldLibReady]);

  if (items.length === 0 && !isRedirecting) {
    return (
      <div className={styles.wrapper} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
         <div className="text-center flex flex-col items-center gap-6" style={{ padding: "2rem" }}>
            <h2 className="text-serif text-3xl">Tu carrito está vacío</h2>
            <p className="text-accent-gold font-bold uppercase tracking-widest text-[10px]">Agrega productos para continuar</p>
            <a href={`/${locale}/productos`} className="btn btn-primary px-8 py-3">Ver Productos</a>
         </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <style>{`@keyframes overlay-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        id="payment-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: isRedirecting ? 'rgba(0,0,0,0.85)' : 'transparent',
          display: isRedirecting ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'none',
        }}
      >
        {!boldConfig ? (
          <>
            <div style={{
              width: 64, height: 64,
              border: '4px solid #CBA87C',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'overlay-spin 1s linear infinite',
              marginBottom: '2rem',
            }} />
            <h2 style={{ fontSize: '1.875rem', fontWeight: 400, marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
              {testMode ? 'Simulando Pago' : 'Redirigiendo al Pago'}
            </h2>
            <p style={{ opacity: 0.6, maxWidth: '28rem' }}>
              {testMode
                ? 'Estamos conectando con la plataforma de pago simulada de Antíca.'
                : 'Estamos conectando con nuestra pasarela segura.'}
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 400, marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
              {testMode ? 'Simular Pago' : 'Ir al Pago Seguro'}
            </h2>
            <p style={{ opacity: 0.6, maxWidth: '28rem', marginBottom: '2rem' }}>
              Haz clic en el botón para continuar con el pago.
            </p>
            <button
              id="custom-button-payment"
              onClick={() => {
                boldCheckoutRef.current?.open();
              }}
              style={{
                padding: '1rem 3rem',
                backgroundColor: '#CBA87C',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Pagar ahora
            </button>
            <button
              onClick={() => { setIsRedirecting(false); setLoading(false); setSubmitted(false); }}
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
                marginTop: '1rem',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </>
        )}
      </div>

      <section
        className={styles.hero}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url('${heroImage}')`,
          height: "30vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className={styles.heroContent}>
          <h1 className="text-serif text-5xl md:text-6xl text-white mb-2">{t("title")}</h1>
          <div className="h-1 w-12 bg-accent-gold mx-auto rounded-full" />
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.formCard}>
            <form ref={formRef} className={styles.formSection}>
              <div className="flex items-center justify-between mb-8">
                <h2 className={styles.formTitle} style={{ marginBottom: 0 }}>
                  {t("billingDetails") || "Detalles de Facturación"}
                </h2>
                {testMode && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                    Modo Test Activo
                  </span>
                )}
              </div>

              <div className={styles.formSection}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t("name")}</label>
                  <input name="name" placeholder="Ej. Juan Pérez" className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t("email")}</label>
                  <input name="email" type="email" placeholder="juan@ejemplo.com" className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t("phone")}</label>
                  <input name="phone" type="tel" placeholder="+57 300 123 4567" className={styles.input} required />
                </div>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Tipo de Documento</label>
                    <select name="docType" className={styles.select} required>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="NIT">NIT</option>
                      <option value="CE">Cédula de Extranjería</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>{t("documentId")}</label>
                    <input name="docId" placeholder="Número de documento" className={styles.input} required />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{t("address")}</label>
                  <input name="address" placeholder="Dirección completa" className={styles.input} required />
                </div>
                <button type="button" className={styles.payButton} onClick={handlePay} disabled={submitted}>
                  {loading ? 'Procesando...' : (testMode ? 'Simular Pago y Finalizar' : 'Ir al Pago Seguro')}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>{t("orderSummary")}</h2>
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <img
                    src={item.image_url || "/media/placeholder.png"}
                    alt={item.name[locale]}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name[locale]}</span>
                    <div className="flex items-center gap-2">
                       <span className={styles.itemPrice}>$ {item.price} {currency}</span>
                       <span className={styles.itemQty}>x {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.totals}>
              <div className={styles.subtotalRow}>
                <span>Subtotal</span>
                <span>$ {getTotalPrice()} {currency}</span>
              </div>
              <div className={styles.subtotalRow}>
                <span>Envío</span>
                <span className="text-green-500 font-bold uppercase text-[9px]">Gratis</span>
              </div>
              <div className={styles.totalRow}>
                <span>{t("total")}</span>
                <span>$ {getTotalPrice()} {currency}</span>
              </div>
            </div>
            <div className={styles.secureBadge}>
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               {testMode ? 'Entorno de Pruebas Antíca' : 'Pago 100% Seguro'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
