import { getTranslations } from "next-intl/server";
import PageHero from "@/components/PageHero/PageHero";
import SpacesCarousel from "@/components/SpacesCarousel/SpacesCarousel";
import { getCmsMedia } from "@/lib/cms";

export default async function ChefPage() {
  const t = await getTranslations("Chef");

  // Obtener imagen del hero
  // @cms-group "Cabeceras de Secciones" @cms-label "Fondo de Cabecera (Chef)" @cms-type single
  const heroImage = (await getCmsMedia(
    "chef_hero",
    "/media/DSC01073.jpg",
  )) as string;

  // Obtener imágenes del CMS para cada sección del chef
  // @cms-group "Página Chef" @cms-label "Imágenes Chef 1" @cms-type gallery
  const chef1Images = await getCmsMedia("chef_imagenes_1", [
    "/media/DSC01979.jpg",
    "/media/DSC01841.jpg",
    "/media/DSC01839.jpg",
    "/media/DSC01707.jpg",
    "/media/DSC01073.jpg",
  ]);
  // @cms-group "Página Chef" @cms-label "Imágenes Chef 2" @cms-type gallery
  const chef2Images = await getCmsMedia("chef_imagenes_2", [
    "/media/DSC01707.jpg",
    "/media/DSC01073.jpg",
    "/media/DSC01454.jpg",
    "/media/DSC01209.jpg",
    "/media/DSC01203.jpg",
  ]);
  // @cms-group "Página Chef" @cms-label "Imágenes Chef 3" @cms-type gallery
  const chef3Images = await getCmsMedia("chef_imagenes_3", [
    "/media/DSC01209.jpg",
    "/media/DSC01203.jpg",
    "/media/regala/exp-roma1.jpg",
    "/media/DSC01979.jpg",
    "/media/DSC01841.jpg",
  ]);

  const chefData = [
    {
      id: "1",
      title: t("space1.title"),
      description: t("space1.description"),
      images: Array.isArray(chef1Images)
        ? chef1Images
        : [chef1Images].filter(Boolean),
    },
    {
      id: "2",
      title: t("space2.title"),
      description: t("space2.description"),
      images: Array.isArray(chef2Images)
        ? chef2Images
        : [chef2Images].filter(Boolean),
    },
    {
      id: "3",
      title: t("space3.title"),
      description: t("space3.description"),
      images: Array.isArray(chef3Images)
        ? chef3Images
        : [chef3Images].filter(Boolean),
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
      <SpacesCarousel spacesData={chefData} />
    </main>
  );
}
