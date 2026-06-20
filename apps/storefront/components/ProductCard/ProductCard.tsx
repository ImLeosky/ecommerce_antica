"use client"; // Ahora es un Client Component

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/cartStore";
import { getSettings } from "@/lib/cms";
import { useState, useEffect } from "react";
import { toast } from "@repo/ui/toast";
import styles from "./ProductCard.module.css";

type Product = {
  id: number;
  name: Record<string, string>;
  price: number;
  image_url: string | null;
  description?: Record<string, string>;
  available: boolean;
  buyable: boolean;
};

type ProductCardProps = {
  product: Product;
  locale: string;
};

const ProductCard = ({ product, locale }: ProductCardProps) => {
  const [currency, setCurrency] = useState("COP");
  const t = useTranslations("GiftPage");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchCurrency = async () => {
      const curr = await getSettings("currency", "COP");
      setCurrency(curr);
    };
    fetchCurrency();
  }, []);

  // Función para quitar etiquetas HTML
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    // Evitamos que al hacer clic en el botón se dispare el Link de la tarjeta (si hubiera uno envolviéndola)
    e.preventDefault();
    e.stopPropagation();

    // Añadimos al carrito
    addItem(product);

    toast.success(`${product.name[locale]} añadido al carrito`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name[locale] || "Imagen"}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>

      <h3 className={styles.name}>{product.name[locale]}</h3>
      <p className={styles.price}>
        $ {product.price} {currency}
      </p>

      {product.description && product.description[locale] && (
        <div className={styles.description}>
          {stripHtml(product.description[locale]).length > 150 ? (
            <>
              {stripHtml(product.description[locale]).substring(0, 150)}...
              <Link
                href={`/${locale}/experiencias/${product.id}`}
                className={styles.verMas}
              >
                Ver más
              </Link>
            </>
          ) : (
            stripHtml(product.description[locale])
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Link
          href={`/${locale}/experiencias/${product.id}`}
          className="btn btn-outline"
        >
          {t("viewDetails")}
        </Link>

        {/* Botón de Añadir al Carrito - solo si es comprable */}
        {product.buyable ? (
          <button onClick={handleAddToCart} className="btn btn-primary">
            {t("addToCart")}
          </button>
        ) : (
          <span className="text-sm text-gray-500">
            {t("notAvailableForPurchase")}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
