"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import styles from "./ProductDetail.module.css";
import AddToCartButton from "@/components/AddToCartButton";
import BuyNowButton from "@/components/BuyNowButton";
import ProductImageGallery from "./ProductImageGallery";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // Handle images: always include image_url first, then image_gallery if exists
  const images = [];
  if (data.image_url) {
    images.push(data.image_url);
  }
  if (data.image_gallery && Array.isArray(data.image_gallery)) {
    images.push(...data.image_gallery);
  }

  return { ...data, images };
}

export default function ProductDetailPage({ params }: PageProps) {
  const locale = useLocale();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;

      const prod = await getProduct(resolvedParams.id);
      if (!prod) {
        notFound();
      }
      setProduct(prod);
      setLoading(false);
    };
    fetchData();
  }, [params]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!product || !descriptionRef.current) return;

    const handleScroll = () => {
      const description = descriptionRef.current;
      if (!description) return;

      const rect = description.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculamos cuánto ha avanzado el scroll dentro del área de la descripción
      // Cuando el top de la descripción llega a la parte superior (o cerca)
      const start = rect.top;
      const height = rect.height;
      const progress = Math.max(0, Math.min(1, -start / (height - 300))); // 300px de margen para el final

      if (rect.top < windowHeight && rect.bottom > 0) {
        const imagesCount = product.images.length;
        const index = Math.floor(progress * imagesCount);
        setCurrentImageIndex(Math.max(0, Math.min(imagesCount - 1, index)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Pequeño retraso para asegurar que el DOM esté pintado tras la navegación
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [product, isMobile]);

  // Auto-slide images
  useEffect(() => {
    if (!product || product.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [product]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    notFound();
  }

  const currency = "COP"; // Default, or fetch

  return (
    <div className={styles.wrapper} key={product.id}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Columna Imagen */}
          <div className={styles.imageContainer}>
            <ProductImageGallery
              images={product.images}
              alt={product.name[locale]}
              currentIndex={currentImageIndex}
              onIndexChange={setCurrentImageIndex}
            />
          </div>

          {/* Columna Información */}
          <div className={styles.info}>
            <h1 className={styles.title}>{product.name[locale]}</h1>
            <p className={styles.price}>
              $ {product.price} {currency}
            </p>
            <div className={styles.divider} />
            <div
              ref={descriptionRef}
              className={styles.description}
              dangerouslySetInnerHTML={{
                __html:
                  product.description?.[locale] ||
                  "Sin descripción disponible.",
              }}
            />

          </div>
        </div>

        {/* Zona de Acción - Ahora FUERA del grid para que el sticky termine antes */}
        {product.buyable ? (
          <div className={styles.innerActions}>
            <AddToCartButton product={product} />
            <BuyNowButton product={product} />
          </div>
        ) : (
          <div className={styles.notAvailable}>
            <p>Este producto no está disponible para compra.</p>
          </div>
        )}
      </div>
    </div>
  );
}
