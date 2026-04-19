"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient"; // Importamos nuestro cliente
import { getSettings } from "@/lib/cms";
import ProductPreviewModal from "@/components/ProductPreviewModal";
import styles from "./CafeMenu.module.css";

// Definimos los tipos de datos que esperamos de Supabase
type MenuItem = {
  id: number;
  name: Record<string, string>;
  price: number;
  description?: Record<string, string>;
  image_url: string | null;
  image_gallery: string[];
};

type MenuCategory = {
  id: number;
  name: Record<string, string>;
  products: MenuItem[];
};

export default function CafeMenu() {
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const [locale] = useState<string>("es"); // Default to 'es', adjust as needed
  const [currency, setCurrency] = useState<string>("PEN"); // Default

  const handleLongPressStart = (product: MenuItem) => {
    longPressTimeout.current = setTimeout(() => {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }, 1000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const [categories, setCategories] = useState<MenuCategory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: fetchedCategories, error } = await supabase
        .from("categories")
        .select(
          `
          id,
          name,
          products!inner (
            id,
            name,
            description,
            price,
            image_url,
            image_gallery
          )
        `,
        )
        .eq("products.available", true)
        .order("sort_order", { ascending: true })
        .order("id", { foreignTable: "products", ascending: true });

      if (!error && fetchedCategories) {
        setCategories(fetchedCategories);
      }

      // Fetch currency
      const storeSettings = await getSettings("store_settings", {});
      const fetchedCurrency = storeSettings.currency || "PEN";
      setCurrency(fetchedCurrency);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalOpen]);

  // Render each category as a modern card
  const renderCategory = (category: MenuCategory) => (
    <div key={category.id} className={styles.menuCategory}>
      <h4 className={styles.categoryTitle}>{category.name[locale]}</h4>
      <div className={styles.menuItems}>
        {category.products.map((item) => (
          <div
            key={item.id}
            className={styles.menuItem}
            onMouseDown={() => handleLongPressStart(item)}
            onMouseUp={handleLongPressEnd}
            onTouchStart={() => handleLongPressStart(item)}
            onTouchEnd={handleLongPressEnd}
          >
            <div className={styles.itemContent}>
              <span className={styles.itemName}>{item.name[locale]}</span>
              {item.description && item.description[locale] && (
                <span
                  className={styles.itemDesc}
                  dangerouslySetInnerHTML={{ __html: item.description[locale] }}
                />
              )}
            </div>
            <span className={styles.itemPrice}>
              $ {item.price} {currency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section id="cafe-menu" className={`${styles.cafeMenuSection} fade-in`}>
      <div className="container-custom">
        <div className="text-center mb-12 flex flex-col items-center">
          <h2
            className="text-serif text-5xl md:text-6xl mb-4"
            style={{ letterSpacing: "4px" }}
          >
            MENÚ
          </h2>
          <h3
            className="text-sans text-lg md:text-xl uppercase tracking-widest mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Antíca Café
          </h3>
          <div className={`${styles.menuDivider} mx-auto`}></div>
        </div>

        <div className={styles.menuGrid}>{categories.map(renderCategory)}</div>
      </div>
      {selectedProduct &&
        typeof window !== "undefined" &&
        createPortal(
          <ProductPreviewModal
            product={selectedProduct}
            locale={locale}
            onClose={() => {
              setSelectedProduct(null);
              setIsModalOpen(false);
            }}
          />,
          document.body,
        )}
    </section>
  );
}
