"use client"; // Ahora es un Client Component

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/cartStore"; // Importamos el store
import styles from "./ProductCard.module.css";

type Product = {
  id: number;
  name: Record<string, string>;
  price: number;
  image_url: string | null;
  description?: Record<string, string>;
};

type ProductCardProps = {
  product: Product;
  locale: string;
};

const ProductCard = ({ product, locale }: ProductCardProps) => {
  const t = useTranslations("GiftPage");
  const addItem = useCartStore((state) => state.addItem);

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

    // Opcional: Podrías disparar una alerta o abrir el drawer aquí
    alert(`${product.name[locale]} añadido al carrito`);
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
      <p className={styles.price}>${product.price}</p>

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

        {/* Botón de Añadir al Carrito */}
        <button onClick={handleAddToCart} className="btn btn-primary">
          {t("addToCart")}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
