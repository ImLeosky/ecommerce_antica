import Hero from "@/components/Hero/Hero";
import CafeMenu from "@/components/CafeMenu/CafeMenu";
import ReservationForm from "@/components/ReservationForm/ReservationForm";
import AboutSection from "@/components/AboutSection/AboutSection";
import SpacesSection from "@/components/SpacesSection/SpacesSection";
import ChefSection from "@/components/ChefSection/ChefSection";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getCmsMedia } from "@/lib/cms";

// En Next.js 15, params es una Promesa
export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  // OBLIGATORIO: Esperar los params
  const { locale } = await props.params;

  // @cms-group "Home Page" @cms-label "Imagen Sección Espacios"
  const spacesImage = (await getCmsMedia(
    "home_spaces_image",
    "/media/DSC01979.jpg",
  )) as string;
  // @cms-group "Home Page" @cms-label "Imagen Sección Chef"
  const chefImage = (await getCmsMedia(
    "home_chef_image",
    "/media/DSC01073.jpg",
  )) as string;
  // @cms-group "Home Page" @cms-label "Fondo Sección de Reservas"
  const reservationBg = (await getCmsMedia(
    "home_reservation_bg",
    "",
  )) as string;

  return (
    <main>
      <Hero />
      <AboutSection locale={locale} />
      <ScrollReveal direction="up" delay={200}>
        <ChefSection imageSrc={chefImage} />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={300}>
        <SpacesSection imageSrc={spacesImage} />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={400}>
        <CafeMenu />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={600} threshold={0.05}>
        <ReservationForm reservationBg={reservationBg} />
      </ScrollReveal>
    </main>
  );
}
