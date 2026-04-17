"use client";

import React, { useState, useEffect } from "react";
import { Link } from "../../i18n/routing";
import styles from "./MessagesCarousel.module.css";

interface BrandMessage {
  title: string;
  message: string;
}

interface MessagesCarouselProps {
  messages: BrandMessage[];
}

const MessagesCarousel: React.FC<MessagesCarouselProps> = ({ messages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  if (!messages || messages.length === 0) {
    return null;
  }

  const currentMessage = messages[currentIndex]!;

  return (
    <section className={styles.messagesSection}>
      <div className={styles.container}>
        <div className={styles.carousel}>
          <div className={styles.carouselRow}>
            <button
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={goToPrevious}
              aria-label="Previous message"
            >
              ‹
            </button>

            <div className={styles.messageCard}>
              <div className={styles.messageContent}>
                <h3 className={styles.messageTitle}>{currentMessage.title}</h3>
                <p className={styles.messageText}>{currentMessage.message}</p>
              </div>
              <div className={styles.messageActions}>
                <Link href="/nosotros">
                  <button className={styles.discoverButton}>
                    Conoce Nuestra Historia
                  </button>
                </Link>
              </div>
            </div>

            <button
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={goToNext}
              aria-label="Next message"
            >
              ›
            </button>
          </div>

          <div className={styles.indicators}>
            {messages.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${
                  index === currentIndex ? styles.active : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to message ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessagesCarousel;
