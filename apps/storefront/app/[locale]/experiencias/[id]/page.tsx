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
  const [galleryTop, setGalleryTop] = useState(50);
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
    if (!product || !descriptionRef.current) return;

    const handleScroll = () => {
      const description = descriptionRef.current;
      if (!description) return;

      const rect = description.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Check if description is in view
      if (rect.top < windowHeight && rect.bottom > 0) {
        // Calculate how much of the description is visible
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, windowHeight);
        const visibleHeight = visibleBottom - visibleTop;
        const descriptionHeight = rect.height;

        // Progress from 0 to 1 as more of the description becomes visible
        const scrollProgress = Math.max(
          0,
          Math.min(1, visibleHeight / descriptionHeight),
        );

        // Divide into parts based on number of images
        const imagesCount = product.images.length;
        const index = Math.floor(scrollProgress * imagesCount);
        setCurrentImageIndex(Math.max(0, Math.min(imagesCount - 1, index)));

        // Move gallery with scroll
        setGalleryTop(50 + scrollY * 0.2); // Adjust factor
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [product]);

  // Auto-change if description is short (fits in viewport without scrolling)
  useEffect(() => {
    if (!product || product.images.length <= 1) return;

    const checkAutoSlide = () => {
      const description = descriptionRef.current;
      if (description) {
        const rect = description.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // If description fits entirely in viewport, enable auto-slide
        if (
          rect.height <= windowHeight &&
          rect.top >= 0 &&
          rect.bottom <= windowHeight
        ) {
          const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
          }, 3000);
          return () => clearInterval(interval);
        }
      }
    };

    const handleScroll = () => checkAutoSlide();

    window.addEventListener("scroll", handleScroll, { passive: true });
    checkAutoSlide(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [product]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    notFound();
  }

  const currency = "COP"; // Default, or fetch

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Columna Imagen */}
          <ProductImageGallery
            images={product.images}
            alt={product.name[locale]}
            currentIndex={currentImageIndex}
            onIndexChange={setCurrentImageIndex}
            top={galleryTop}
          />

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

            {product.buyable ? (
              <div className={styles.actions}>
                <AddToCartButton product={product} />
                <BuyNowButton product={product} />
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Este producto no está disponible para compra.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
