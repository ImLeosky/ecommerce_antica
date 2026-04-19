"use client";
import { useCartStore } from "@/lib/cartStore";
import { useLocale } from "next-intl";
import { getSettings } from "@/lib/cms";
import { useState, useEffect } from "react";
import styles from "./CartDrawer.module.css";
import { useRouter } from "../../i18n/routing";

export const CartDrawer = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [currency, setCurrency] = useState("COP");
  const { items, removeItem, getTotalPrice } = useCartStore();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    const fetchCurrency = async () => {
      const curr = await getSettings("currency", "COP");
      setCurrency(curr);
    };
    fetchCurrency();
  }, []);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className="text-serif">Tu Carrito</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        <div className={styles.itemList}>
          {items.length === 0 ? (
            <p>El carrito está vacío</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <img
                  src={item.image_url || ""}
                  className={styles.itemImage}
                  alt=""
                />
                <div className={styles.itemInfo}>
                  <h4 className="text-serif">{item.name[locale]}</h4>
                  <p className="text-sans">
                    $ {item.price} {currency} x {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className={styles.removeBtn}
                  aria-label={`Eliminar ${item.name[locale]}`}
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total:</span>
              <span className="text-accent">
                $ {getTotalPrice()} {currency}
              </span>
            </div>
            <button className="btn btn-primary" onClick={handleCheckout}>
              Pagar Ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
