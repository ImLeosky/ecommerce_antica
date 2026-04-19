"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./PageHero.module.css";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
}

interface PageHeroProps {
  slides: Slide[];
}

const PageHero: React.FC<PageHeroProps> = ({ slides }) => {
  // Ensure at least 3 slides by repeating if necessary
  const extendedSlides =
    slides.length >= 3
      ? slides
      : Array(3)
          .fill(slides[0])
          .map((slide, index) => ({
            ...slide,
            // If more slides needed, keep same content but could customize
          }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Slide cycling effect
  useEffect(() => {
    if (extendedSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % extendedSlides.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [extendedSlides.length]);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        const currentImageRef = imageRefs.current[currentIndex];
        if (!currentImageRef) return;
        const scrollY = window.scrollY;
        // Calculate scale: starts at 1 and zooms in as you scroll down
        const maxScale = 1.3;
        const scale = Math.min(1 + scrollY * 0.0004, maxScale);

        currentImageRef.style.transform = `scale(${scale})`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Execute once initially
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentIndex]);

  const currentSlide = extendedSlides[currentIndex];

  return (
    <section className={styles.hero}>
      <div className={styles.heroImageContainer}>
        {extendedSlides.map((slide, index) => (
          <img
            key={index}
            ref={(el) => {
              imageRefs.current[index] = el;
            }}
            src={slide.image}
            alt={`Page Hero ${index + 1}`}
            className={`${styles.heroImage} ${
              index === currentIndex ? styles.active : ""
            }`}
          />
        ))}
      </div>
      <div className={styles.overlay}></div>
      <div className={`${styles.heroContent} fadeIn`}>
        <h1 className={`${styles.heroTitle} text-serif`}>
          {currentSlide.title}
        </h1>
        <p className={`${styles.heroSubtitle} text-sans`}>
          {currentSlide.subtitle}
        </p>
        {currentSlide.buttonText && currentSlide.buttonLink && (
          <a href={currentSlide.buttonLink} className={styles.heroButton}>
            {currentSlide.buttonText}
          </a>
        )}
      </div>
    </section>
  );
};

export default PageHero;
