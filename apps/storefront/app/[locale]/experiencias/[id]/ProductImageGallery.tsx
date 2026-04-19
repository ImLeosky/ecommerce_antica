"use client";

import styles from "./ProductImageGallery.module.css";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  top?: number;
}

export default function ProductImageGallery({
  images,
  alt,
  currentIndex,
  onIndexChange,
  top,
}: ProductImageGalleryProps) {
  const handleThumbnailClick = (index: number) => {
    onIndexChange(index);
  };

  if (!images || images.length === 0) {
    return <div className={styles.placeholder} />;
  }

  return (
    <div className={styles.gallery} style={top ? { top: `${top}px` } : {}}>
      {/* Main Image */}
      <div className={styles.mainImageContainer}>
        <img
          src={images[currentIndex]}
          alt={alt}
          className={styles.mainImage}
        />
        {/* Indicators */}
        {images.length > 1 && (
          <div className={styles.indicators}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentIndex ? styles.active : ""}`}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ""}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img src={image} alt={`${alt} ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
