"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./ProductsList.module.css";

type Product = {
  id: number;
  name: Record<string, string>;
  price: number;
  image_url: string | null;
  category_id: number;
  description?: Record<string, string>;
};

type Category = {
  id: number;
  name: Record<string, string>;
};

interface ProductsListProps {
  products: Product[];
  categories: Category[];
  locale: string;
  showCategoryFilter?: boolean;
}

export default function ProductsList({
  products,
  categories,
  locale,
  showCategoryFilter = false,
}: ProductsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const t = useTranslations(
    showCategoryFilter ? "ProductosPage" : "ExperienciasPage",
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name[locale]
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !showCategoryFilter ||
        selectedCategory === null ||
        product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory, locale, showCategoryFilter]);

  return (
    <div>
      {/* Filters */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder={
            t("searchPlaceholder") ||
            (showCategoryFilter
              ? "Buscar productos..."
              : "Buscar experiencias...")
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid var(--border-color)",
            borderRadius: "0.5rem",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            flex: "1",
            minWidth: "200px",
          }}
        />
        {showCategoryFilter && (
          <select
            value={selectedCategory || ""}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value ? Number(e.target.value) : null,
              )
            }
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid var(--border-color)",
              borderRadius: "0.5rem",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">
              {t("allCategories") || "Todas las categorías"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name[locale]}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>{t("noProductsFound") || "No se encontraron experiencias."}</p>
        </div>
      )}
    </div>
  );
}
