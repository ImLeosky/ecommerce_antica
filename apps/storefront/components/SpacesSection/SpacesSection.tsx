import React from "react";
import { getCmsMedia, getCmsText } from "@/lib/cms";
import { Link } from "@/i18n/routing";
import styles from "./SpacesSection.module.css";

interface SpacesSectionProps {
  locale: string;
}

export default async function SpacesSection({ locale }: SpacesSectionProps) {
  // @cms-group "Home Page" @cms-label "Imagen Sección Espacios" @cms-type single
  const imageSrc = (await getCmsMedia(
    "home_spaces_image",
    "/media/DSC01979.jpg",
  )) as string;

  // @cms-group "Spaces" @cms-label "Título"
  const title = await getCmsText(locale, "Spaces.title", "Nuestros Espacios");
  
  // @cms-group "Spaces" @cms-label "Descripción"
  const description = await getCmsText(locale, "Spaces.description", "Descubre los ambientes únicos que hacen de Antica un lugar especial para disfrutar de momentos inolvidables.");
  
  // @cms-group "Spaces" @cms-label "Texto Botón"
  const buttonText = await getCmsText(locale, "Spaces.button", "Ver Todos los Espacios");

  return (
    <section className={styles.spacesSection}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img src={imageSrc} alt={title} className={styles.image} />
          </div>
          <div className={styles.content}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <Link href="/espacios">
              <button className={styles.button}>{buttonText}</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
