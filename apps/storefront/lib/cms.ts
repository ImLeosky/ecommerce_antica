import { supabase } from "@/lib/supabaseClient";

export async function getCmsMedia(
  slotKey: string,
  fallbackData: string | string[],
): Promise<string | string[]> {
  try {
    const { data, error } = await supabase
      .from("storefront_content")
      .select("content")
      .eq("id", "media_registry")
      .single();

    if (!error && data?.content && data.content[slotKey]) {
      const val = data.content[slotKey];
      if (Array.isArray(val) && val.length === 0) return fallbackData;
      if (typeof val === "string" && val.trim() === "") return fallbackData;

      return val;
    }
  } catch (e) {
    console.error("Error fetching CMS media", e);
  }
  return fallbackData;
}

export async function getCmsText(
  locale: string,
  textKey: string,
  fallbackData: string,
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("storefront_content")
      .select("content")
      .eq("id", "translations")
      .single();

    if (error || !data?.content || !data.content[locale]) {
      return fallbackData;
    }

    const path = textKey.split(".");
    let val: any = data.content[locale];
    for (const p of path) {
      val = val?.[p];
    }
    if (typeof val === "string" && val.trim() !== "") {
      return val;
    }
  } catch (e) {
    console.error("Error fetching CMS text", e);
  }
  return fallbackData;
}
