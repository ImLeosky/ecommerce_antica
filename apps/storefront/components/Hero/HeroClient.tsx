"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Hero.module.css";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink?: string;
}

interface HeroClientProps {
  slides: Slide[];
}

export function HeroClient({ slides }: HeroClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Ensure at least 3 slides
  const extendedSlides =
    slides.length >= 3
      ? slides
      : Array(3).fill(
          slides[0] || {
            image: "/media/DSC01073.jpg",
            title: "Antica",
            subtitle: "Experiencia culinaria única",
            buttonText: "Descubre más",
            buttonLink: "/es/nosotros",
          },
        );

  useEffect(() => {
    if (extendedSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % extendedSlides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [extendedSlides.length]);

  useEffect(() => {
    let animationFrameId: number;
    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        const currentImageRef = imageRefs.current[currentIndex];
        if (!currentImageRef) return;
        const scrollY = window.scrollY;
        const maxScale = 1.3;
        const scale = Math.min(1 + scrollY * 0.0004, maxScale);
        currentImageRef.style.transform = `scale(${scale})`;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
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
          <div
            key={index}
            ref={(el) => {
              imageRefs.current[index] = el;
            }}
            className={`${styles.heroImageWrapper} ${index === currentIndex ? styles.active : ""}`}
          >
            <Image
              src={slide.image}
              alt={`Antica Hero ${index + 1}`}
              fill
              sizes="100vw"
              quality={85}
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className={styles.overlay}></div>

      <div className={`${styles.heroContent} ${styles.fadeIn}`}>
        <h1 className={`${styles.heroTitle} text-serif`}>
          {currentSlide.title}
        </h1>
        <p className={`${styles.heroSubtitle} text-sans`}>
          {currentSlide.subtitle}
        </p>
        <a
          href={currentSlide.buttonLink || "/es/nosotros"}
          className={`${styles.btnPrimary} ${styles.pointerAuto}`}
        >
          {currentSlide.buttonText}
        </a>
      </div>
    </section>
  );
}
