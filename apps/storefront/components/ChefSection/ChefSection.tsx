import React from "react";
import { getCmsMedia, getCmsText } from "@/lib/cms";
import { Link } from "@/i18n/routing";
import styles from "./ChefSection.module.css";

interface ChefSectionProps {
  locale: string;
}

export default async function ChefSection({ locale }: ChefSectionProps) {
  // @cms-group "Home Page" @cms-label "Imagen Sección Chef" @cms-type single
  const imageSrc = (await getCmsMedia(
    "home_chef_image",
    "/media/DSC01073.jpg",
  )) as string;

  // @cms-group "Chef" @cms-label "Título"
  const title = await getCmsText(locale, "Chef.title", "Nuestro Chef");
  
  // @cms-group "Chef" @cms-label "Descripción"
  const description = await getCmsText(locale, "Chef.description", "Conoce al maestro detrás de nuestra cocina especializada, dedicada a crear experiencias culinarias únicas.");
  
  // @cms-group "Chef" @cms-label "Texto Botón"
  const buttonText = await getCmsText(locale, "Chef.button", "Conoce Más");

  return (
    <section className={styles.chefSection}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img src={imageSrc} alt={title} className={styles.image} />
          </div>
          <div className={styles.content}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <Link href="/chef">
              <button className={styles.button}>{buttonText}</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
