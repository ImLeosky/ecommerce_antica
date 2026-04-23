import { getLocale } from "next-intl/server";
import { getCmsText } from "@/lib/cms";

import styles from "./AnnouncementBanner.module.css";

export default async function AnnouncementBanner() {
  const locale = await getLocale();

  console.log("AnnouncementBanner - Fetching scheduleText from CMS");
  // @cms-group "General" @cms-label "Texto del Banner de Horarios"
  const scheduleText = await getCmsText(
    locale,
    "announcement_schedule",
    locale === "es"
      ? "Horarios de atención: 9:30 am a 9 pm. Lunes cerrado."
      : "Business hours: 9:30 am to 9 pm. Closed on Mondays.",
  );
  console.log(
    "AnnouncementBanner - scheduleText result:",
    JSON.stringify(scheduleText),
  );

  return (
    <div className={styles.banner}>
      <div className="container-custom">
        <div
          className={styles.text}
          dangerouslySetInnerHTML={{ __html: scheduleText }}
        />
      </div>
    </div>
  );
}
