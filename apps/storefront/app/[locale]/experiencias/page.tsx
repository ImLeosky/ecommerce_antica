import { getLocale, getTranslations } from "next-intl/server";
import { supabase } from "@/lib/supabaseClient";
import { getCmsMedia } from "@/lib/cms";
import PageHero from "@/components/PageHero/PageHero";
import ProductsList from "@/components/ProductsList/ProductsList";
import styles from "./ExperienciasPage.module.css";

type Product = {
  id: number;
  name: Record<string, string>;
  price: number;
  image_url: string | null;
  category_id: number;
  description?: Record<string, string>;
  available: boolean;
  buyable: boolean;
};

type Category = {
  id: number;
  name: Record<string, string>;
};

async function getExperienceProducts() {
  const locale = await getLocale();

  try {
    // Get categories to find EXPERIENCIAS
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*");

    if (catError) {
      console.error("Error fetching categories:", catError);
      return { products: [], categories: [] };
    }

    // Find the EXPERIENCIAS category
    const experienceCategory = categories?.find(
      (cat) =>
        cat.name &&
        cat.name[locale] === (locale === "es" ? "EXPERIENCIAS" : "EXPERIENCES"),
    );

    if (!experienceCategory) {
      console.log("No EXPERIENCIAS category found");
      return { products: [], categories: [] };
    }

    // Get products from EXPERIENCIAS category and only available ones
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", experienceCategory.id)
      .eq("available", true);

    if (prodError) {
      console.error("Error fetching products:", prodError);
      return { products: [], categories: [experienceCategory] };
    }

    return { products: products || [], categories: [experienceCategory] };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { products: [], categories: [] };
  }
}

export default async function ExperienciasPage() {
  const locale = await getLocale();
  const { products, categories } = await getExperienceProducts();
  const t = await getTranslations("ExperienciasPage");
  // @cms-group "Cabeceras de Secciones" @cms-label "Galería de Imágenes Hero (Experiencias)" @cms-type gallery
  const heroImages = (await getCmsMedia("experiencias_hero_gallery", [
    "/media/DSC01073.jpg",
  ])) as string[];

  return (
    <>
      <PageHero
        slides={heroImages.map((image) => ({
          image,
          title: t("title"),
          subtitle: t("subtitle"),
        }))}
      />

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className="container-custom">
          <ProductsList
            products={products}
            categories={categories}
            locale={locale}
            showCategoryFilter={false}
          />
        </div>
      </section>
    </>
  );
}
