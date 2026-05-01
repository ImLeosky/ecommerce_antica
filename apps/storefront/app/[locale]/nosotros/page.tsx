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
        className={styles.nosotrosHero}
        slides={[
          {
            image: heroImage,
            title: t.raw("heroTitle"),
            subtitle: t.raw("heroSubtitle"),
          },
        ]}
      />

      {/* 2. INTRODUCCIÓN HISTÓRICA */}
      <ScrollReveal direction="up" delay={200}>
        <section className={styles.introHistory}>
          <div className={styles.container}>
            <ScrollReveal direction="right" delay={400}>
              <h2
                className={styles.historyTitle}
                dangerouslySetInnerHTML={{ __html: t.raw("historyTitle") }}
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={600}>
              <div className={styles.divider} />
            </ScrollReveal>
            <ScrollReveal direction="fade" delay={800}>
              <p
                className={styles.historyBody}
                dangerouslySetInnerHTML={{ __html: t.raw("historyText") }}
              />
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>

      {/* 3. BLOQUES GENERACIONALES */}
      <ScrollReveal direction="up" delay={400}>
        <section className={styles.blocksSection}>
          {/* Don Luis */}
          <AboutBlock
            title={t.raw("sections.luis.title")}
            text={t.raw("sections.luis.text")}
            image={luisImage}
          />

          {/* La Hija - Antica */}
          <AboutBlock
            title={t.raw("sections.daughter.title")}
            text={t.raw("sections.daughter.text")}
            image={hijaImage}
            reverse
          />

          {/* Víctor - Crezia */}
          <AboutBlock
            title={t.raw("sections.victor.title")}
            text={t.raw("sections.victor.text")}
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
                  <h2
                    className="text-serif"
                    dangerouslySetInnerHTML={{ __html: t.raw("sections.union.title") }}
                  />
                  <p dangerouslySetInnerHTML={{ __html: t.raw("sections.union.text") }} />
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
                  <h2
                    className="text-serif"
                    dangerouslySetInnerHTML={{ __html: t.raw("sections.family.title") }}
                  />
                  <p dangerouslySetInnerHTML={{ __html: t.raw("sections.family.text") }} />
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
              <h2
                className="text-serif"
                dangerouslySetInnerHTML={{
                  __html: t.raw("sections.inauguration.title"),
                }}
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={1400}>
              <div className={styles.divider} />
            </ScrollReveal>
            <ScrollReveal direction="fade" delay={1600}>
              <div
                className={styles.inaugurationText}
                dangerouslySetInnerHTML={{
                  __html: t.raw("sections.inauguration.text"),
                }}
              ></div>
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
