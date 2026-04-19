import { getTranslations } from "next-intl/server";
import { getCmsMedia } from "@/lib/cms";
import { HeroClient } from "./HeroClient";

const Hero = async () => {
  const t = await getTranslations("Hero");

  // @cms-group "Home Page" @cms-label "Imágenes del Hero (Carrusel)" @cms-type gallery
  const dbImages = await getCmsMedia("home_hero_image", [
    "/media/DSC01073.jpg",
  ]);
  const images =
    Array.isArray(dbImages) && dbImages.length > 0
      ? dbImages
      : ["/media/DSC01073.jpg"];

  // Get texts for each slide from translations
  const title1 = t("home_hero_title1");
  const subtitle1 = t("home_hero_subtitle1");
  const button1 = t("home_hero_button1");
  const link1 = t("home_hero_link1");

  const title2 = t("home_hero_title2");
  const subtitle2 = t("home_hero_subtitle2");
  const button2 = t("home_hero_button2");
  const link2 = t("home_hero_link2");

  const title3 = t("home_hero_title3");
  const subtitle3 = t("home_hero_subtitle3");
  const button3 = t("home_hero_button3");
  const link3 = t("home_hero_link3");

  // Create slides: use images, and assign texts
  const slideTexts = [
    {
      title: title1,
      subtitle: subtitle1,
      buttonText: button1,
      buttonLink: link1,
    },
    {
      title: title2,
      subtitle: subtitle2,
      buttonText: button2,
      buttonLink: link2,
    },
    {
      title: title3,
      subtitle: subtitle3,
      buttonText: button3,
      buttonLink: link3,
    },
  ];

  const slides = images.map((image, index) => {
    const i = Math.min(index, 2);
    return {
      image,
      title: slideTexts[i]!.title,
      subtitle: slideTexts[i]!.subtitle,
      buttonText: slideTexts[i]!.buttonText,
      buttonLink: slideTexts[i]!.buttonLink,
    };
  });

  return <HeroClient slides={slides} />;
};

export default Hero;
