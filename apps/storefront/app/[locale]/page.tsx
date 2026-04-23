import Hero from "@/components/Hero/Hero";
import CafeMenu from "@/components/CafeMenu/CafeMenu";
import ReservationForm from "@/components/ReservationForm/ReservationForm";
import AboutSection from "@/components/AboutSection/AboutSection";
import SpacesSection from "@/components/SpacesSection/SpacesSection";
import ChefSection from "@/components/ChefSection/ChefSection";
import ReviewsSection from "@/components/ReviewsSection";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getCmsMedia } from "@/lib/cms";

// En Next.js 15, params es una Promesa
export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  // OBLIGATORIO: Esperar los params
  const { locale } = await props.params;

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
        <ChefSection locale={locale} />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={300}>
        <SpacesSection locale={locale} />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={500}>
        <CafeMenu />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={550}>
        <ReviewsSection />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={600} threshold={0.05}>
        <ReservationForm reservationBg={reservationBg} />
      </ScrollReveal>
    </main>
  );
}
