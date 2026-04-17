"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import styles from "./ChefSection.module.css";

interface ChefSectionProps {
  imageSrc: string;
}

const ChefSection: React.FC<ChefSectionProps> = ({ imageSrc }) => {
  const t = useTranslations("Chef");

  return (
    <section className={styles.chefSection}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img src={imageSrc} alt={t("imageAlt")} className={styles.image} />
          </div>
          <div className={styles.content}>
            <h2 className={styles.title}>{t("title")}</h2>
            <p className={styles.description}>{t("description")}</p>
            <Link href="/chef">
              <button className={styles.button}>{t("button")}</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChefSection;
