import { getLocale, getTranslations } from "next-intl/server";
import { supabase } from "@/lib/supabaseClient";
import GiftForm from "@/components/GiftForm/GiftForm";
import { getCmsMedia } from "@/lib/cms";
import PageHero from "@/components/PageHero/PageHero";
import styles from "./RegalaPage.module.css";

type Product = {
  id: number;
  name: Record<string, string>;
  price: number;
  image_url: string | null;
  available: boolean;
  buyable: boolean;
};

async function getExperienceProducts() {
  const locale = await getLocale();

  try {
    // First, let's see what categories exist
    const { data: allCats, error: catError } = await supabase
      .from("categories")
      .select("*");

    console.log("All categories:", allCats);

    // Find the category by name
    const categoryName = locale === "es" ? "EXPERIENCIAS" : "EXPERIENCES";
    const category = allCats?.find(
      (cat) => cat.name && cat.name[locale] === categoryName,
    );

    console.log("Category name searched:", categoryName);
    console.log("Category found:", category);

    if (!category) {
      console.log("No category found with name:", categoryName);
      return [];
    }

    // Get products for this category and only available ones
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", category.id)
      .eq("available", true);

    console.log("Products found:", products);

    if (prodError) {
      console.error("Error fetching products:", prodError);
      return [];
    }

    return products || [];
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
}

export default async function RegalaPage() {
  const locale = await getLocale();
  const products: Product[] = await getExperienceProducts();
  const t = await getTranslations("GiftPage");
  // @cms-group "Cabeceras de Secciones" @cms-label "Fondo de Cabecera (Regalo)"
  const heroImage = (await getCmsMedia(
    "regala_hero",
    "/media/DSC01073.jpg",
  )) as string;

  return (
    <>
      <PageHero
        slides={[
          {
            image: heroImage,
            title: t("title"),
            subtitle: t("subtitle"),
          },
        ]}
      />

      {/* Gift Form Section */}
      <section className={styles.giftSection}>
        <div className="container-custom">
          <div className={styles.formContainer}>
            <GiftForm products={products} locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
