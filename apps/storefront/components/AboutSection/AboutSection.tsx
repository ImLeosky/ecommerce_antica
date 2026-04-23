import React from "react";
import { ScrollReveal } from "../ScrollReveal";
import { getCmsMedia, getCmsText } from "@/lib/cms";
import MessagesCarousel from "../MessagesCarousel/MessagesCarousel";

import styles from "./AboutSection.module.css";

const AboutSection = async ({ locale }: { locale: string }) => {
  // @cms-group "About Section" @cms-label "Imagen de Sobre Nosotros" @cms-type single
  const imageUrl = (await getCmsMedia(
    "home_about_image",
    "/media/DSC01203.jpg",
  )) as string;

  // @cms-group "About Section" @cms-label "Título Principal"
  console.log("AboutSection - Fetching mainTitle from CMS");
  const mainTitle = await getCmsText(
    locale,
    "About.main_title",
    "El orgullo del sur de Colombia",
  );
  console.log("AboutSection - mainTitle result:", JSON.stringify(mainTitle));

  // @cms-group "About Section" @cms-label "Subtítulo"
  console.log("AboutSection - Fetching boxSubtitle from CMS");
  const boxSubtitle = await getCmsText(
    locale,
    "About.box_subtitle",
    "Antica M&M, una experiencia que trasciende el tiempo",
  );
  console.log(
    "AboutSection - boxSubtitle result:",
    JSON.stringify(boxSubtitle),
  );

  // Fetch brand messages from CMS
  const brandMessages = [
    {
      // @cms-group "Carousel" @cms-label "Título 1"
      title: await getCmsText(locale, "Carousel.title_1", "Tradición Familiar"),
      // @cms-group "Carousel" @cms-label "Mensaje 1"
      message: await getCmsText(
        locale,
        "Carousel.message_1",
        "Antica M&M no nació para vender café. Nació para preservar el legado de quienes nos enseñaron a trabajar, creer y amar.",
      ),
    },
    {
      // @cms-group "Carousel" @cms-label "Título 2"
      title: await getCmsText(
        locale,
        "Carousel.title_2",
        "Calidad Incomparable",
      ),
      // @cms-group "Carousel" @cms-label "Mensaje 2"
      message: await getCmsText(
        locale,
        "Carousel.message_2",
        "Cada taza cuenta una historia de dedicación y calidad que trasciende generaciones.",
      ),
    },
    {
      // @cms-group "Carousel" @cms-label "Título 3"
      title: await getCmsText(locale, "Carousel.title_3", "Raíces Colombianas"),
      // @cms-group "Carousel" @cms-label "Mensaje 3"
      message: await getCmsText(
        locale,
        "Carousel.message_3",
        "Desde las alturas de los Andes, representamos la esencia pura de la tradición cafetera del sur de Colombia.",
      ),
    },
    {
      // @cms-group "Carousel" @cms-label "Título 4"
      title: await getCmsText(locale, "Carousel.title_4", "Pasión por el Café"),
      // @cms-group "Carousel" @cms-label "Mensaje 4"
      message: await getCmsText(
        locale,
        "Carousel.message_4",
        "Nuestra pasión va más allá del producto; es una celebración de la cultura, la familia y las raíces.",
      ),
    },
  ];

  return (
    <section className={styles.aboutSection}>
      <div className={styles.container}>
        {/* Hero Section with Image */}
        <ScrollReveal direction="up" delay={0}>
          <div className={styles.heroSection}>
            <div className={styles.imageWrapper}>
              <img
                src={imageUrl}
                alt="Antica M&M - El orgullo del sur de Colombia"
                className={styles.heroImage}
              />
              <div className={styles.imageOverlay}></div>
            </div>

            <div className={styles.heroContent}>
              <ScrollReveal direction="right" delay={300}>
                <h2
                  className={`${styles.mainTitle} text-serif`}
                  dangerouslySetInnerHTML={{ __html: mainTitle }}
                />
              </ScrollReveal>
              <ScrollReveal direction="up" delay={500}>
                <div className={styles.titleDivider}></div>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={700}>
                <p
                  className={styles.heroSubtitle}
                  dangerouslySetInnerHTML={{ __html: boxSubtitle }}
                />
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>

        {/* Messages Carousel */}
        <ScrollReveal direction="up" delay={200}>
          <MessagesCarousel messages={brandMessages} />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AboutSection;
