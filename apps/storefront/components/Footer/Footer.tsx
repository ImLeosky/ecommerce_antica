import { getCmsMedia, getCmsText } from "@/lib/cms";
import styles from "./Footer.module.css";
import Image from "next/image";
import Link from "next/link";

const Footer = async ({ locale }: { locale: string }) => {
  // @cms-group "Footer" @cms-label "Logo del Footer" @cms-type single
  const logoUrl = (await getCmsMedia(
    "footer_logo",
    "/media/logo-antica-footer.png",
  )) as string;

  // @cms-group "Footer" @cms-label "Descripción del Footer"
  const description = (await getCmsText(
    locale,
    "Footer.description",
    "Café de especialidad de tres generaciones, cultivado en las tierras del Huila, Colombia.",
  )) as string;

  // @cms-group "Footer" @cms-label "Texto de Copyright"
  const copyrightText = (await getCmsText(
    locale,
    "Footer.copyright",
    "© 2025 Antica M&M. Todos los derechos reservados.",
  )) as string;

  // @cms-group "Footer" @cms-label "Enlace de Facebook"
  const facebookUrl = (await getCmsText(
    locale,
    "Footer.facebook",
    "https://www.facebook.com/AnticaPitalito",
  )) as string;

  // @cms-group "Footer" @cms-label "Enlace de TikTok"
  const tiktokUrl = (await getCmsText(
    locale,
    "Footer.tiktok",
    "https://www.tiktok.com/@antica_cafe",
  )) as string;

  // @cms-group "Footer" @cms-label "Enlace de Instagram"
  const instagramUrl = (await getCmsText(
    locale,
    "Footer.instagram",
    "https://www.instagram.com/antica.mm",
  )) as string;

  const DEFAULT_MAP =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.7471373366902!2d-76.0648682250332!3d1.846243998136877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e250b45daa130e9%3A0xfb0469db8e4d0e10!2sANTICA%20M%26M!5e0!3m2!1ses!2sco!4v1776320116765!5m2!1ses!2sco";

  // @cms-group "Footer" @cms-label "Embed de Google Maps"
  const mapsEmbedRaw = (await getCmsText(
    locale,
    "Footer.mapsEmbed",
    DEFAULT_MAP,
  )) as string;

  const getMapsSrc = (input: string) => {
    if (!input) return DEFAULT_MAP;
    try {
      const trimmed = input.trim();
      if (trimmed.includes("google.com/maps/embed")) {
        return trimmed;
      }
      const iframeMatch = trimmed.match(/src=["']([^"']+)["']/);
      if (iframeMatch && iframeMatch[1]) {
        const url = iframeMatch[1];
        if (url.includes("google.com/maps/embed")) {
          return url;
        }
      }
      return DEFAULT_MAP;
    } catch {
      return DEFAULT_MAP;
    }
  };

  const mapsSrc = getMapsSrc(mapsEmbedRaw);

  // @cms-group "Footer" @cms-label "Dirección"
  const addressText = (await getCmsText(
    locale,
    "Footer.address",
    "Pitalito, Huila - Colombia",
  )) as string;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            {logoUrl && (
              <div className={styles.logo}>
                <Image
                  src={logoUrl}
                  alt="Antica M&M"
                  width={180}
                  height={60}
                  className={styles.logoImage}
                />
              </div>
            )}
            <p className={styles.description}>{description}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Explorar</h3>
            <ul className={styles.links}>
              <li>
                <Link href="/es">Inicio</Link>
              </li>
              <li>
                <Link href="/es/nosotros">Nosotros</Link>
              </li>
              <li>
                <Link href="/es/experiencias">Experiencias</Link>
              </li>
              <li>
                <Link href="/es/espacios">Espacios</Link>
              </li>
              <li>
                <Link href="/es/regala">Regala</Link>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Síguenos</h3>
            <div className={styles.social}>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={styles.socialLink}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className={styles.socialLink}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Visítanos</h3>
            <div className={styles.map}>
              <iframe
                src={mapsSrc}
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Antica M&M"
              />
            </div>
            <p className={styles.address}>{addressText}</p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
