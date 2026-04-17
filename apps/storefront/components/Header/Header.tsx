"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Link as IntlLink, usePathname, useRouter } from "../../i18n/routing";
import styles from "./Header.module.css";
import { useCartStore } from "@/lib/cartStore";
import { CartDrawer } from "../Cart/CartDrawer";
import { useTheme } from "../ThemeProvider";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ width: 36 }} />;

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label="Toggle Theme"
    >
      {theme === "light" ? "☾" : "☼"}
    </button>
  );
};

interface HeaderProps {
  logoUrl?: string;
}

const Header = ({ logoUrl }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLocale = locale === "es" ? "en" : "es";
    router.replace({ pathname }, { locale: newLocale });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.container}>
          {/* LADO IZQUIERDO: Menú Hamburguesa */}
          <div className={styles.leftSide}>
            <button
              className={`${styles.menuToggle} ${isMenuOpen ? styles.active : ""}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
            </button>
          </div>

          {/* CENTRO: Logo */}
          <div className={styles.logoContainer}>
            <Link href={`/${locale}`} style={{ textDecoration: "none" }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Antica Logo"
                  className={styles.logoImage}
                  style={{ height: "40px", width: "auto" }}
                />
              ) : (
                <h1 className={`${styles.logoText} text-serif`}>ANTICA</h1>
              )}
            </Link>
          </div>

          {/* LADO DERECHO: Navegación */}
          <div className={styles.rightSide}>
            <nav className={styles.nav}>
              <Link
                href={`/${locale}#reservation`}
                className={`${styles.navBtn} ${styles.btnPrimary}`}
              >
                {t("reserve")}
              </Link>
              <Link
                href={`/${locale}/regala`}
                className={`${styles.navBtn} ${styles.btnOutline}`}
              >
                {t("gift")}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className={styles.cartBtn}
              >
                <img
                  src={`/cart-${theme === "light" ? "black" : "white"}.svg`}
                  alt="Cart"
                  style={{
                    width: "24px",
                    height: "24px",
                    marginRight: "8px",
                    verticalAlign: "middle",
                  }}
                />
                {t("cart")} ({mounted ? totalItems : 0})
              </button>

              <button onClick={toggleLanguage} className={styles.langSelector}>
                {locale === "es" ? "EN" : "ES"}
              </button>

              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ""}`}
      >
        <nav className={styles.mobileNav}>
          <Link
            href={`/${locale}#cafe-menu`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("menu")}
          </Link>
          <Link
            href={`/${locale}/experiencias`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("experiences")}
          </Link>
          <Link
            href={`/${locale}/productos`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("products")}
          </Link>
          <IntlLink href="/nosotros" onClick={() => setIsMenuOpen(false)}>
            {t("nosotros")}
          </IntlLink>
          <IntlLink href="/espacios" onClick={() => setIsMenuOpen(false)}>
            {t("spaces")}
          </IntlLink>
          <IntlLink href="/chef" onClick={() => setIsMenuOpen(false)}>
            {t("chef")}
          </IntlLink>

          <div className={styles.mobileOnly}>
            <Link
              href={`/${locale}#reservation`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("reserve")}
            </Link>
            <Link
              href={`/${locale}/regala`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("gift")}
            </Link>

            <div className={styles.mobileNavSeparator}></div>

            <button
              onClick={() => {
                setIsCartOpen(true);
                setIsMenuOpen(false);
              }}
              className={styles.mobileNavBtn}
            >
              <img
                src={`/cart-${theme === "light" ? "black" : "white"}.svg`}
                alt="Cart"
                style={{
                  width: "24px",
                  height: "24px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              />
              {t("cart")} ({mounted ? totalItems : 0})
            </button>

            <button
              onClick={() => {
                toggleLanguage();
                setIsMenuOpen(false);
              }}
              className={styles.mobileNavBtn}
            >
              {locale === "es" ? "EN" : "ES"}
            </button>

            <div className={styles.mobileNavTheme}>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
