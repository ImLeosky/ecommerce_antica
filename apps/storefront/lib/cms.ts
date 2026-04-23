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
      return processDbText(val);
    }
    return fallbackData;
  } catch (e) {
    console.error("Error fetching CMS text", e);
  }
  return fallbackData;
}

export function processDbText(html: string): string {
  if (typeof html !== "string") return html;

  // 1. Decodificar entidades HTML comunes (incluso si vienen doblemente escapadas)
  let text = html;
  let prev = "";
  let iterations = 0;
  
  while (text !== prev && iterations < 5) {
    prev = text;
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
      
    // Decodificar entidades numéricas como &#60; (<) o hex &#x3C; (<)
    text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
    text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    
    iterations++;
  }

  // 2. Reemplazar saltos de línea y cierres de párrafo por \n
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/g, "\n");
  
  // 3. Eliminar cualquier etiqueta HTML
  text = text.replace(/<[^>]+>/g, "");
  
  // 4. Eliminar múltiples saltos de línea consecutivos
  text = text.replace(/\n\s*\n/g, "\n").trim();
  
  // 5. Remover espacios al principio y final de líneas
  return text.replace(/^\s+|\s+$/g, "").replace(/\n\s*/g, "\n  ");
}

export async function getSettings(key: string, fallback: any): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("admin_config")
      .select("value")
      .eq("key", key)
      .single();

    if (!error && data?.value !== undefined) {
      return data.value;
    }
  } catch (e) {
    console.error("Error fetching settings", e);
  }
  return fallback;
}
