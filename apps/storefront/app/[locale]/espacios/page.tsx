import { getTranslations } from "next-intl/server";
import PageHero from "@/components/PageHero/PageHero";
import SpacesCarousel from "@/components/SpacesCarousel/SpacesCarousel";
import { getCmsMedia } from "@/lib/cms";

export default async function SpacesPage() {
  const t = await getTranslations("Spaces");

  // Obtener imagen del hero
  // @cms-group "Cabeceras de Secciones" @cms-label "Fondo de Cabecera (Espacios)" @cms-type single
  const heroImage = (await getCmsMedia(
    "espacios_hero",
    "/media/DSC01073.jpg",
  )) as string;

  // Obtener imágenes del CMS para cada espacio
  // @cms-group "Página Espacios" @cms-label "Imágenes Espacio 1" @cms-type gallery
  const space1Images = await getCmsMedia("espacios_imagenes_1", [
    "/media/DSC01979.jpg",
    "/media/DSC01841.jpg",
    "/media/DSC01839.jpg",
    "/media/DSC01707.jpg",
    "/media/DSC01073.jpg",
  ]);
  // @cms-group "Página Espacios" @cms-label "Imágenes Espacio 2" @cms-type gallery
  const space2Images = await getCmsMedia("espacios_imagenes_2", [
    "/media/DSC01707.jpg",
    "/media/DSC01073.jpg",
    "/media/DSC01454.jpg",
    "/media/DSC01209.jpg",
    "/media/DSC01203.jpg",
  ]);
  // @cms-group "Página Espacios" @cms-label "Imágenes Espacio 3" @cms-type gallery
  const space3Images = await getCmsMedia("espacios_imagenes_3", [
    "/media/DSC01209.jpg",
    "/media/DSC01203.jpg",
    "/media/regala/exp-roma1.jpg",
    "/media/DSC01979.jpg",
    "/media/DSC01841.jpg",
  ]);

  const spacesData = [
    {
      id: "1",
      title: t("space1.title"),
      description: t("space1.description"),
      images: Array.isArray(space1Images)
        ? space1Images
        : [space1Images].filter(Boolean),
    },
    {
      id: "2",
      title: t("space2.title"),
      description: t("space2.description"),
      images: Array.isArray(space2Images)
        ? space2Images
        : [space2Images].filter(Boolean),
    },
    {
      id: "3",
      title: t("space3.title"),
      description: t("space3.description"),
      images: Array.isArray(space3Images)
        ? space3Images
        : [space3Images].filter(Boolean),
    },
  ];

  return (
    <main>
      <PageHero
        slides={[
          {
            image: heroImage,
            title: t("heroTitle"),
            subtitle: t("heroSubtitle"),
          },
        ]}
      />
      <SpacesCarousel spacesData={spacesData} />
    </main>
  );
}
