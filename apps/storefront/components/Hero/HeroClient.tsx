"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Hero.module.css";

interface HeroClientProps {
  images: string[];
  title: string;
  subtitle: string;
  buttonText: string;
}

export function HeroClient({
  images,
  title,
  subtitle,
  buttonText,
}: HeroClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

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

  return (
    <section className={styles.hero}>
      <div className={styles.heroImageContainer}>
        {images.map((src, index) => (
          <div
            key={index}
            ref={(el) => {
              imageRefs.current[index] = el;
            }}
            className={`${styles.heroImageWrapper} ${index === currentIndex ? styles.active : ""}`}
          >
            <Image
              src={src}
              alt={`Antica Hero ${index + 1}`}
              fill
              sizes="100vw"
              quality={85}
              priority={index === 0}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <div className={styles.overlay}></div>

      <div className={`${styles.heroContent} ${styles.fadeIn}`}>
        <h1 className={`${styles.heroTitle} text-serif`}>{title}</h1>
        <p className={`${styles.heroSubtitle} text-sans`}>{subtitle}</p>
        <a
          href="/es/nosotros"
          className={`${styles.btnPrimary} ${styles.pointerAuto}`}
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
}
