"use client";

import { useEffect } from "react";
import ProductImageGallery from "@/app/[locale]/experiencias/[id]/ProductImageGallery";
import styles from "./ProductPreviewModal.module.css";

type Product = {
  id: number;
  name: Record<string, string>;
  price: number;
  description?: Record<string, string>;
  image_url: string | null;
  image_gallery: string[];
};

type ProductPreviewModalProps = {
  product: Product | null;
  locale: string;
  onClose: () => void;
};

export default function ProductPreviewModal({
  product,
  locale,
  onClose,
}: ProductPreviewModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!product) return null;

  const images = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.image_gallery || []),
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.content}>
          <div className={styles.gallery}>
            <ProductImageGallery
              images={images}
              alt={product.name[locale] || ""}
              currentIndex={0}
              onIndexChange={() => {}}
            />
          </div>
          <div className={styles.details}>
            <h3 className={styles.title}>{product.name[locale]}</h3>
            <p className={styles.price}>$ {product.price}</p>
            {product.description && product.description[locale] && (
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{
                  __html: product.description[locale],
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
