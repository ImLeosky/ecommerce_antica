"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useTranslations, useLocale } from "next-intl";
import { getSettings } from "@/lib/cms";
import styles from "../Checkout.module.css";
import { toast } from "@repo/ui/toast";

interface CheckoutUIProps {
  heroImage: string;
}

export default function CheckoutUI({ heroImage }: CheckoutUIProps) {
  const [currency, setCurrency] = useState("COP");
  const { items, getTotalPrice, clearCart } = useCartStore();
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrency = async () => {
      const curr = await getSettings("currency", "COP");
      setCurrency(curr);
    };
    fetchCurrency();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      customer_name: formData.get("name"),
      customer_email: formData.get("email"),
      customer_document_type: formData.get("docType"),
      customer_document_id: formData.get("docId"),
      customer_address: formData.get("address"),
      total_amount: getTotalPrice(),
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      })),
    };

    console.log("Datos de la orden listos para Supabase y Siigo:", orderData);
    toast.info(
      "Simulación: Orden guardada. En un entorno real, aquí irías a la pasarela de pago.",
    );
    setLoading(false);
  };

  if (items.length === 0)
    return <div className="p-20 text-center">Tu carrito está vacío.</div>;

  return (
    <div className={styles.wrapper}>
      {/* Hero Banner dinámico */}
      <section
        className={styles.hero}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${heroImage}')`,
          height: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <h1 className="text-serif text-5xl">{t("title")}</h1>
      </section>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Formulario */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className="text-serif text-2xl mb-6">{t("billingDetails")}</h2>

            <input
              name="name"
              placeholder={t("name")}
              className={styles.input}
              required
            />
            <input
              name="email"
              type="email"
              placeholder={t("email")}
              className={styles.input}
              required
            />

            <div className={styles.row}>
              <select name="docType" className={styles.input} required>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="NIT">NIT</option>
                <option value="CE">Cédula de Extranjería</option>
              </select>
              <input
                name="docId"
                placeholder={t("documentId")}
                className={styles.input}
                required
              />
            </div>

            <input
              name="address"
              placeholder={t("address")}
              className={styles.input}
              required
            />

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? "Procesando..." : t("payButton")}
            </button>
          </form>

          {/* Resumen */}
          <div className={styles.summary}>
            <h2 className="text-serif text-2xl mb-6">{t("orderSummary")}</h2>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <span>
                  {item.name[locale]} x {item.quantity}
                </span>
                <span>
                  $ {item.price * item.quantity} {currency}
                </span>
              </div>
            ))}
            <div className={styles.total}>
              <span>{t("total")}</span>
              <span className="text-accent">
                $ {getTotalPrice()} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
