"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./ReviewsSection.module.css";

interface Review {
  name: string;
  rating: number;
  comment: string;
}

const dummyReviews: Review[] = [
  {
    name: "María González",
    rating: 5,
    comment:
      "¡Excelente experiencia! El café es de primera calidad y el ambiente es perfecto.",
  },
  {
    name: "Carlos Rodríguez",
    rating: 4,
    comment:
      "Muy buen lugar para disfrutar de un buen café. El servicio es amable.",
  },
  {
    name: "Ana López",
    rating: 5,
    comment:
      "Los postres son deliciosos. Recomiendo el croissant de frutos rojos.",
  },
  {
    name: "Pedro Martínez",
    rating: 4,
    comment: "Ambiente acogedor y tranquilo. Ideal para trabajar o relajarse.",
  },
  {
    name: "Laura Sánchez",
    rating: 5,
    comment: "El cappuccino es el mejor que he probado. ¡Volveré pronto!",
  },
  {
    name: "Diego Torres",
    rating: 3,
    comment: "Buen lugar, pero los precios son un poco altos.",
  },
  {
    name: "Sofia Ramírez",
    rating: 4,
    comment: "Excelente atención al cliente. Los productos son frescos.",
  },
  {
    name: "Miguel Herrera",
    rating: 5,
    comment: "Perfecto para una cita. Ambiente romántico y delicioso café.",
  },
  {
    name: "Isabella Morales",
    rating: 4,
    comment: "Variedad de opciones veganas. Muy satisfecho con la comida.",
  },
  {
    name: "Juan Pablo Castro",
    rating: 5,
    comment:
      "El mejor lugar para desayunar en la ciudad. ¡Altamente recomendado!",
  },
];

export default function ReviewsSection() {
  const t = useTranslations("Reviews");
  const [paused, setPaused] = useState(false);

  // Calculate average rating
  const averageRating =
    dummyReviews.reduce((sum, review) => sum + review.rating, 0) /
    dummyReviews.length;

  const renderStars = (rating: number) => {
    return "★★★★★".split("").map((star, index) => (
      <span
        key={index}
        className={index < rating ? styles.starFilled : styles.starEmpty}
      >
        {star}
      </span>
    ));
  };

  return (
    <section className={styles.reviewsSection}>
      <div className="container-custom">
        <div className={styles.reviewsHeader}>
          <h2 className={`${styles.title} text-serif`}>
            {t("title") || "Opiniones de Nuestros Clientes"}
          </h2>
          <div className={styles.rating}>
            <div className={styles.stars}>
              {renderStars(Math.round(averageRating))}
            </div>
            <span className={styles.ratingText}>
              {averageRating.toFixed(1)} {t("outOf") || "de"} 5
            </span>
          </div>
        </div>

        <div className={styles.reviewsMarquee}>
          <div
            className={styles.marqueeContent}
            style={{ animationPlayState: paused ? "paused" : "running" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
          >
            {dummyReviews.map((review, index) => (
              <div key={index} className={styles.reviewItem}>
                <span className={styles.reviewAuthor}>{review.name}</span>
                <div className={styles.reviewStars}>
                  {renderStars(review.rating)}
                </div>
                <p className={styles.reviewComment}>
                  &quot;{review.comment}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
