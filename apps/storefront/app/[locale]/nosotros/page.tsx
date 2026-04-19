import { getTranslations } from "next-intl/server";
import styles from "./Nosotros.module.css";
import { AboutBlock } from "./AboutBlock";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getCmsMedia } from "@/lib/cms";
import PageHero from "@/components/PageHero/PageHero";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NosotrosPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("Nosotros");

  // Cargar CMS Media
  // @cms-group "Cabeceras de Secciones" @cms-label "Fondo de Cabecera (Nosotros)"
  const heroImage = (await getCmsMedia(
    "nosotros_hero",
    "/media/nosotros/hero-family.jpg",
  )) as string;
  // @cms-group "Página Nosotros (Historia Familiar)" @cms-label "Retrato de Don Luis Ortega"
  const luisImage = (await getCmsMedia(
    "nosotros_don_luis_image",
    "/media/nosotros/don-luis.jpg",
  )) as string;
  // @cms-group "Página Nosotros (Historia Familiar)" @cms-label "La Visión de Antica"
  const hijaImage = (await getCmsMedia(
    "nosotros_daughter_image",
    "/media/nosotros/luis-hija.jpg",
  )) as string;
  // @cms-group "Página Nosotros (Historia Familiar)" @cms-label "Retrato Crezia Exportación"
  const victorImage = (await getCmsMedia(
    "nosotros_victor_image",
    "/media/nosotros/luis-victor.jpg",
  )) as string;
  // @cms-group "Página Nosotros (Historia Familiar)" @cms-label "Imagen Unión (Hermanos)"
  const unionImage = (await getCmsMedia(
    "nosotros_union_image",
    "/media/nosotros/los-tres.jpg",
  )) as string;
  // @cms-group "Página Nosotros (Historia Familiar)" @cms-label "Retrato Familiar (Pantalla Completa)"
  const familyImage = (await getCmsMedia(
    "nosotros_family_image",
    "/media/nosotros/familia-completa.jpg",
  )) as string;

  return (
    <div className={styles.wrapper}>
      <PageHero
        slides={[
          {
            image: heroImage,
            title: t("heroTitle"),
            subtitle: t("heroSubtitle"),
          },
        ]}
      />

      {/* 2. INTRODUCCIÓN HISTÓRICA */}
      <ScrollReveal direction="up" delay={200}>
        <section className={styles.introHistory}>
          <div className={styles.container}>
            <ScrollReveal direction="right" delay={400}>
              <h2 className="text-serif text-5xl">{t("historyTitle")}</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={600}>
              <div className={styles.divider} />
            </ScrollReveal>
            <ScrollReveal direction="fade" delay={800}>
              <p className={styles.historyBody}>{t("historyText")}</p>
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>

      {/* 3. BLOQUES GENERACIONALES */}
      <ScrollReveal direction="up" delay={400}>
        <section className={styles.blocksSection}>
          {/* Don Luis */}
          <AboutBlock
            title={t("sections.luis.title")}
            text={t("sections.luis.text")}
            image={luisImage}
          />

          {/* La Hija - Antica */}
          <AboutBlock
            title={t("sections.daughter.title")}
            text={t("sections.daughter.text")}
            image={hijaImage}
            reverse
          />

          {/* Víctor - Crezia */}
          <AboutBlock
            title={t("sections.victor.title")}
            text={t("sections.victor.text")}
            image={victorImage}
          />
        </section>
      </ScrollReveal>

      {/* 4. SECCIÓN DE LA UNIÓN (Los 3) */}
      <ScrollReveal direction="left" delay={600}>
        <section className={styles.unionSection}>
          <div className={styles.container}>
            <div className={styles.unionContent}>
              <ScrollReveal direction="right" delay={800}>
                <div className={styles.unionText}>
                  <h2 className="text-serif">{t("sections.union.title")}</h2>
                  <p>{t("sections.union.text")}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={1000}>
                <div className={styles.unionImage}>
                  <img src={unionImage} alt="Unión Ortega" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 5. SECCIÓN FAMILIAR Y OBJETIVO (La Familia Completa) */}
      <ScrollReveal direction="fade" delay={800} threshold={0.05}>
        <section className={styles.familySection}>
          <div className={styles.familyImageFull}>
            <img src={familyImage} alt="Familia Ortega" />
            <div className={styles.familyOverlay}>
              <ScrollReveal direction="up" delay={1000}>
                <div className={styles.familyText}>
                  <h2 className="text-serif">{t("sections.family.title")}</h2>
                  <p>{t("sections.family.text")}</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 6. SECCIÓN DE INAUGURACIÓN */}
      <ScrollReveal direction="up" delay={1000} threshold={0.05}>
        <section className={styles.inaugurationSection}>
          <div className={styles.container}>
            <ScrollReveal direction="right" delay={1200}>
              <h2 className="text-serif">{t("sections.inauguration.title")}</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={1400}>
              <div className={styles.divider} />
            </ScrollReveal>
            <ScrollReveal direction="fade" delay={1600}>
              <div className={styles.inaugurationText}>
                {t("sections.inauguration.text")
                  .split("\n\n")
                  .map((paragraph, index) => (
                    <ScrollReveal
                      key={index}
                      direction="up"
                      delay={1800 + index * 300}
                    >
                      <p className={styles.inaugurationParagraph}>
                        {paragraph.split("\n").map((line, lineIndex) => (
                          <span key={lineIndex}>
                            {line}
                            {lineIndex < paragraph.split("\n").length - 1 && (
                              <br />
                            )}
                          </span>
                        ))}
                      </p>
                    </ScrollReveal>
                  ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>

      {/* 7. CALL TO ACTION FINAL */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h3 className="text-serif">
            ¿Quieres ser parte de nuestra historia?
          </h3>
          <p className="text-sans">
            Te invitamos a probar el fruto de décadas de tradición y esfuerzo.
          </p>
          <div className={styles.ctaButtons}>
            <Link href={`/${locale}#cafe-menu`} className="btn btn-primary">
              Ver Menú
            </Link>
            <Link href={`/${locale}/regala`} className="btn btn-outline">
              Regala una Experiencia
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
