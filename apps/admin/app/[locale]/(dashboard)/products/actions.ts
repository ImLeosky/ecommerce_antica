"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveProduct(formData: FormData) {
  const supabase = await createClient();

  // Parse ID (if editing)
  const idStr = formData.get("id") as string;
  const id = idStr ? parseInt(idStr, 10) : null;

  // Parse localizations
  const name_es = formData.get("name_es") as string;
  const name_en = formData.get("name_en") as string;
  const description_es = formData.get("description_es") as string;
  const description_en = formData.get("description_en") as string;

  const name = { es: name_es, en: name_en };
  const description = { es: description_es, en: description_en };

  // Other fields
  const price = parseFloat(formData.get("price") as string);
  const category_id = parseInt(formData.get("category_id") as string, 10);
  const available = formData.get("available") === "true";
  const buyable = formData.get("buyable") === "true";

  const image_url = formData.get("image_url") as string;
  const image_gallery = formData
    .getAll("image_gallery")
    .map((file) => file as string);

  const payload = {
    name,
    description,
    price,
    category_id,
    available,
    buyable,
    image_url,
    image_gallery,
  };

  if (id) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("products").insert([payload]);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/products");
}
